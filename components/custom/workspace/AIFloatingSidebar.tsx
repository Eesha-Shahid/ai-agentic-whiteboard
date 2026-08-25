import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import {
  ArrowUp,
  Loader2Icon,
  LucideIcon,
  Monitor,
  Network,
  PencilRuler,
  Smartphone,
  Sparkles,
  WandSparkles,
  Workflow,
  X,
} from "lucide-react";
import axios from "axios";

type Props = {
  excalidrawApi: ExcalidrawImperativeAPI | null;
  onClose: () => void;
};

const AiTools = [
  {
    name: "Generate Diagrams",
    desc: "Turn ideas into structured diagrams",
    icon: PencilRuler,
    color: "blue",
    prompt: `
      You are an expert visual diagram generation agent.
      Your task is to convert the user's idea into a clear, structured, professional diagram.
      Instructions:
      - Understand the user's intent before generating.
      - Identify the main entities, concepts, steps, and relationships.
      - Create a clean visual hierarchy.
      - Use rectangles for main concepts or processes.
      - Use diamonds only for decisions.
      - Use arrows to show relationships or direction.
      - Keep labels short and readable.
      - Avoid overlapping elements.
      - Maintain consistent spacing between elements.
      - Organize the diagram from left-to-right or top-to-bottom depending on what is easiest to understand.
      - Add groups or sections when the diagram contains multiple categories.
      - Prefer simple layouts over overly complex diagrams.
      - Output only valid Excalidraw-compatible JSON elements.
      - Do not include markdown, explanations, or additional text outside the JSON.
      - For comparison layouts, do not draw any connections between the main topic and its Pros/Cons content. Rely on visual grouping (proximity and containment) only. Reserve connections for flowcharts and architecture diagrams where an actual process or data flow exists.
    `,
  },
  {
    name: "Flowchart",
    desc: "Map out steps, decisions, and branches",
    icon: Workflow,
    color: "purple",
    prompt: `
      You are an expert flowchart generation agent.
      Convert the user's description into a professional flowchart.

      Instructions:
      - Identify the starting point, actions, decisions, branches, and ending points.
      - Use rounded rectangles for start and end nodes.
      - Use rectangles for actions or processes.
      - Use diamonds for decisions.
      - Use arrows to connect nodes in the correct logical order.
      - Label decision arrows clearly, such as "Yes" and "No".
      - Keep the primary workflow flowing from top to bottom.
      - Branch secondary flows to the left or right.
      - Keep node labels concise.
      - Avoid crossing arrows whenever possible.
      - Maintain consistent node dimensions and spacing.
      - Make the flowchart understandable without additional explanation.
      - If the user's description is incomplete, infer the most logical workflow.
      - Output only valid Excalidraw-compatible JSON elements.
      - Do not return markdown or explanatory text.
      - When a decision node has multiple outgoing branches (e.g. Yes/No), separate them horizontally — do not stack sequential unrelated nodes directly between a decision and its branch targets. Give branch paths their own distinct x-offset from the main vertical flow.
    `,
  },
  {
    name: "Architecture",
    desc: "Visualize systems and data flow",
    icon: Network,
    color: "orange",
    prompt: `
      You are a senior software architect and system design visualization agent.

      Convert the user's application or system description into a clear system architecture diagram.

      Instructions:
      - Identify clients, frontend applications, backend services, APIs, databases, queues, storage, caches, and third-party services.
      - Group related components into logical sections.
      - Show the direction of data flow using arrows.
      - Clearly label important connections when useful.
      - Place users or client applications on the left or top.
      - Place application services in the center.
      - Place databases, storage, and infrastructure on the right or bottom.
      - Place third-party APIs or external services in a separate section.
      - Use consistent component sizes.
      - Keep architecture readable and avoid unnecessary implementation details.
      - Include technologies mentioned by the user as labels.
      - Infer standard architectural components only when necessary.
      - Do not invent unnecessary technologies.
      - Use containers or background sections for Frontend, Backend, Data Layer, AI Services, External Services, etc.
      - Output only valid Excalidraw-compatible JSON elements.
      - Do not return markdown, commentary, or explanations.
    `,
  },
  {
    name: "Web Mockup",
    desc: "Sketch website layouts and pages",
    icon: Monitor,
    color: "cyan",
    prompt: `
      You are an expert product designer and web UI wireframe generation agent.

      Convert the user's description into a professional desktop web application wireframe.

      Instructions:

      - Create the interface using simple wireframe-style Excalidraw elements.
      - Assume a desktop viewport unless the user specifies otherwise.
      - Identify the main page structure and user goals.
      - Include relevant UI sections such as:
        - Navbar or header
        - Sidebar
        - Page title
        - Search
        - Filters
        - Cards
        - Tables
        - Forms
        - Buttons
        - Content panels
        - Footer
      - Use rectangles for containers, cards, buttons, images, and input fields.
      - Use text elements for labels and content.
      - Maintain strong spacing, alignment, and visual hierarchy.
      - Use realistic dashboard or SaaS layout conventions.
      - Keep the design low-fidelity and wireframe oriented.
      - Do not create decorative artwork unless specifically requested.
      - Keep the page within a reasonable desktop canvas size.
      - Group related UI sections visually.
      - Make important primary actions easy to identify.
      - Output only valid Excalidraw-compatible JSON elements.
      - Do not return markdown or explanations.
      - This is a static UI mockup, not a flowchart. Do NOT generate any connections or arrows between elements. Always return "connections": [].
    `,
  },
  {
    name: "Mobile Mockup",
    desc: "Design mobile app screens",
    icon: Smartphone,
    color: "pink",
    prompt: `
      You are an expert mobile product designer and mobile wireframe generation agent.

      Convert the user's app idea into a professional mobile app wireframe.

      Instructions:
      - Design for a standard mobile screen size.
      - Create a phone frame or clear screen boundary.
      - Focus on the primary user experience described by the user.
      - Include relevant mobile UI patterns such as:
        - App header
        - Search
        - Cards
        - Lists
        - Forms
        - Bottom navigation
        - Floating action buttons
        - Tabs
        - Profile sections
        - Modals or sheets when necessary
      - Use rectangles for UI containers and controls.
      - Use text elements for labels.
      - Maintain consistent padding and spacing.
      - Use a vertical layout optimized for mobile interaction.
      - Keep buttons large enough to represent touch-friendly controls.
      - Keep the design low-fidelity and wireframe focused.
      - If multiple screens are needed, arrange them horizontally with clear spacing.
      - Label each screen clearly.
      - Prioritize usability and simple navigation.
      - Output only valid Excalidraw-compatible JSON elements.
      - Do not return markdown, explanations, or commentary.
      - This is a static UI mockup, not a flowchart. Do NOT generate any connections or arrows between elements. Always return "connections": [].
    `,
  },
];

const SUGGESTIONS: Record<string, string[]> = {
  "Generate Diagrams": [
    "Compare remote vs office work",
    "Explain the water cycle",
  ],
  Flowchart: [
    "User login and password reset flow",
    "Order fulfillment process",
  ],
  Architecture: [
    "SaaS app with Next.js and Postgres",
    "Microservices with a message queue",
  ],
  "Web Mockup": ["SaaS pricing page", "Admin dashboard with sidebar"],
  "Mobile Mockup": ["Food delivery home screen", "Fitness app workout tracker"],
};

const AI_PLACEHOLDER_IDS = {
  container: "ai-placeholder-container",
  title: "ai-placeholder-title",
  subtitle: "ai-placeholder-subtitle",
  skeleton1: "ai-placeholder-skeleton-1",
  skeleton2: "ai-placeholder-skeleton-2",
  skeleton3: "ai-placeholder-skeleton-3",
};

function AIFloatingSidebar({ excalidrawApi, onClose }: Props) {
  const [selectedTool, setSelectedTool] = useState("Generate Diagrams");
  const [isGenerating, setIsGenerating] = useState(false);
  const [userInput, setUserInput] = useState("");
  const placeholderPositionRef = useRef<{ x: number; y: number } | null>(null);

  const COLOR_STYLES: Record<string, string> = {
    blue: "bg-[#EEF2FF] text-[#4338CA]",
    purple: "bg-[#EEF2FF] text-[#4338CA]",
    orange: "bg-[#FFF1F2] text-[#FB7185]",
    cyan: "bg-[#EEF2FF] text-[#4338CA]",
    pink: "bg-[#FFF1F2] text-[#FB7185]",
  };

  const getEmptyCanvasPosition = () => {
    if (!excalidrawApi) {
      return { x: 100, y: 100 };
    }

    const elements = excalidrawApi
      .getSceneElements()
      .filter((element) => !element.isDeleted);

    if (elements.length === 0) {
      return { x: 100, y: 100 };
    }

    // Find rightmost element
    const maxRight = Math.max(
      ...elements.map((element) => element.x + element.width),
    );
    const minTop = Math.min(...elements.map((element) => element.y));

    return {
      x: maxRight + 150,
      y: minTop,
    };
  };

  const addAiPlaceholder = () => {
    if (!excalidrawApi) return;

    const position = getEmptyCanvasPosition();

    const placeholderElements = convertToExcalidrawElements([
      {
        id: AI_PLACEHOLDER_IDS.container,
        type: "rectangle",
        x: position.x,
        y: position.y,
        width: 420,
        height: 250,
        backgroundColor: "#F5F3FF",
        strokeColor: "#8B5CF6",
        fillStyle: "solid",
        strokeWidth: 2,
        roughness: 0,
        roundness: {
          type: 3,
        },
      },
      {
        id: AI_PLACEHOLDER_IDS.title,
        type: "text",
        x: position.x + 28,
        y: position.y + 28,
        text: "✨ Generating with AI",
        fontSize: 22,
        strokeColor: "#6D28D9",
      },
      {
        id: AI_PLACEHOLDER_IDS.subtitle,
        type: "text",
        x: position.x + 28,
        y: position.y + 65,
        text: "Preparing your diagram...",
        fontSize: 15,
        strokeColor: "#6B7280",
      },
      {
        id: AI_PLACEHOLDER_IDS.skeleton1,
        type: "rectangle",
        x: position.x + 28,
        y: position.y + 115,
        width: 250,
        height: 18,
        backgroundColor: "#DDD6FE",
        strokeColor: "#DDD6FE",
        fillStyle: "solid",
        roughness: 0,
        roundness: {
          type: 3,
        },
      },
      {
        id: AI_PLACEHOLDER_IDS.skeleton2,
        type: "rectangle",
        x: position.x + 28,
        y: position.y + 150,
        width: 330,
        height: 18,
        backgroundColor: "#EDE9FE",
        strokeColor: "#EDE9FE",
        fillStyle: "solid",
        roughness: 0,
        roundness: {
          type: 3,
        },
      },
      {
        id: AI_PLACEHOLDER_IDS.skeleton3,
        type: "rectangle",
        x: position.x + 28,
        y: position.y + 185,
        width: 190,
        height: 18,
        backgroundColor: "#DDD6FE",
        strokeColor: "#DDD6FE",
        fillStyle: "solid",
        roughness: 0,
        roundness: {
          type: 3,
        },
      },
    ]);

    const currentElements = excalidrawApi.getSceneElements();

    excalidrawApi.updateScene({
      elements: [...currentElements, ...placeholderElements],
    });
  };

  const onClickGenerate = async () => {
    addAiPlaceholder();
    setIsGenerating(true);
    const currentAiTool = AiTools.find((tool) => tool.name === selectedTool);

    try {
      const result = await axios.post("/api/ai", {
        userInput: userInput,
        type: currentAiTool?.name,
        systemPrompt: currentAiTool?.prompt,
      });

      removeAiPlaceholder();
      renderAIDiagram(result.data?.diagramResult, currentAiTool?.name || "");
    } catch (error) {
      console.error("AI generation failed:", error);
      removeAiPlaceholder();
    } finally {
      setIsGenerating(false);
    }
  };

  const removeAiPlaceholder = () => {
    if (!excalidrawApi) return;

    const placeholderIds = Object.values(AI_PLACEHOLDER_IDS);
    const elements = excalidrawApi.getSceneElements();
    const updateElements = elements.filter(
      (elements) => !placeholderIds.includes(elements.id),
    );
    excalidrawApi.updateScene({ elements: updateElements });
    placeholderPositionRef.current = null;
  };

  const getConnectionPoints = (fromNode: any, toNode: any) => {
    const fromX = Number(fromNode.x);
    const fromY = Number(fromNode.y);
    const fromWidth = Number(fromNode.width || 200);
    const fromHeight = Number(fromNode.height || 80);

    const toX = Number(toNode.x);
    const toY = Number(toNode.y);
    const toWidth = Number(toNode.width || 200);
    const toHeight = Number(toNode.height || 80);

    const fromCenterX = fromX + fromWidth / 2;
    const fromCenterY = fromY + fromHeight / 2;
    const toCenterX = toX + toWidth / 2;
    const toCenterY = toY + toHeight / 2;

    // Finds where the line from (cx, cy) toward (targetX, targetY)
    // crosses the boundary of a rectangle centered at (cx, cy)
    const getBoundaryPoint = (
      cx: number,
      cy: number,
      halfW: number,
      halfH: number,
      targetX: number,
      targetY: number,
    ) => {
      const dx = targetX - cx;
      const dy = targetY - cy;

      if (dx === 0 && dy === 0) return { x: cx, y: cy };

      // Scale factor to reach the rectangle's edge along this direction
      const scaleX = dx !== 0 ? halfW / Math.abs(dx) : Infinity;
      const scaleY = dy !== 0 ? halfH / Math.abs(dy) : Infinity;
      const scale = Math.min(scaleX, scaleY);

      return { x: cx + dx * scale, y: cy + dy * scale };
    };

    const start = getBoundaryPoint(
      fromCenterX,
      fromCenterY,
      fromWidth / 2,
      fromHeight / 2,
      toCenterX,
      toCenterY,
    );
    const end = getBoundaryPoint(
      toCenterX,
      toCenterY,
      toWidth / 2,
      toHeight / 2,
      fromCenterX,
      fromCenterY,
    );

    return {
      startX: start.x,
      startY: start.y,
      endX: end.x,
      endY: end.y,
    };
  };

  const estimateShapeSize = (
    text: string,
    fontSize: number,
    minWidth: number,
    minHeight: number,
  ) => {
    const avgCharWidth = fontSize * 0.6; // rough monospace-ish estimate, good enough for sizing
    const textWidth = text.length * avgCharWidth;
    const padding = 32;
    return {
      width: Math.max(minWidth, textWidth + padding),
      height: Math.max(minHeight, fontSize * 2.2),
    };
  };

  const renderAIDiagram = (diagram: any, toolType: string) => {
    if (!excalidrawApi) return;

    const aiElements = diagram?.elements || [];
    const isMockup = toolType === "Web Mockup" || toolType === "Mobile Mockup";
    const connections = isMockup ? [] : diagram?.connections || [];

    if (!aiElements.length) return;

    const origin = placeholderPositionRef.current || getEmptyCanvasPosition();

    // AI-generated coordinates start near (0,0) — shift everything so the
    // diagram lands exactly where the placeholder was, not at the AI's own origin
    const minX = Math.min(...aiElements.map((el: any) => Number(el.x || 0)));
    const minY = Math.min(...aiElements.map((el: any) => Number(el.y || 0)));
    const offsetX = origin.x - minX;
    const offsetY = origin.y - minY;

    // Lookup so arrows can reference each node's real, offset position/size
    const nodeMap: Record<string, any> = {};
    aiElements.forEach((el: any) => {
      nodeMap[el.id] = {
        ...el,
        x: Number(el.x || 0) + offsetX,
        y: Number(el.y || 0) + offsetY,
      };
    });

    const nodeSpecs: any[] = [];

    Object.values(nodeMap).forEach((el: any) => {
      const base: any = {
        id: el.id,
        type: el.type,
        x: el.x,
        y: el.y,
        strokeColor: el.strokeColor || "#1e1e1e",
        backgroundColor: el.backgroundColor || "transparent",
        strokeWidth: el.strokeWidth || 2,
        fillStyle: el.fillStyle || "solid",
        roughness: el.roughness ?? 1,
        opacity: el.opacity ?? 100,
      };

      if (el.type === "text") {
        base.text = el.text || "";
        base.fontSize = el.fontSize || 18;
        base.textAlign = el.textAlign || "left";
        nodeSpecs.push(base);
        return;
      }

      base.width = el.width || 160;
      base.height = el.height || 80;
      base.roundness = { type: 3 };

      // Nest the label directly on the shape — convertToExcalidrawElements
      // handles the actual binding, centering, and wrapping itself
      if (el.text) {
        const fontSize = 16;
        const fitted = estimateShapeSize(
          el.text,
          fontSize,
          base.width,
          base.height,
        );
        base.width = fitted.width;
        base.height = fitted.height;
        base.label = {
          text: el.text,
          fontSize,
          strokeColor: el.textColor || "#1e1e1e",
        };
      }

      nodeSpecs.push(base);
    });

    const seenConnections = new Set<string>();
    const dedupedConnections = connections.filter((conn: any) => {
      const key = `${conn.from}->${conn.to}`;
      if (seenConnections.has(key)) return false;
      seenConnections.add(key);
      return true;
    });

    // Build arrow elements from "dedupedConnections", using each node's real position
    const arrowSpecs: any[] = dedupedConnections
      .map((conn: any) => {
        const fromNode = nodeMap[conn.from];
        const toNode = nodeMap[conn.to];
        if (!fromNode || !toNode) return null;

        const { startX, startY, endX, endY } = getConnectionPoints(
          fromNode,
          toNode,
        );

        return {
          id: conn.id || `arrow-${conn.from}-${conn.to}`,
          type: "arrow",
          x: startX,
          y: startY,
          strokeColor: conn.strokeColor || "#1e1e1e",
          strokeWidth: conn.strokeWidth || 2,
          strokeStyle: conn.strokeStyle || "solid",
          roughness: 1,
          startArrowhead:
            conn.startArrowhead && conn.startArrowhead !== "none"
              ? conn.startArrowhead
              : null,
          endArrowhead:
            conn.endArrowhead && conn.endArrowhead !== "none"
              ? conn.endArrowhead
              : "arrow",
          points: [
            [0, 0],
            [endX - startX, endY - startY],
          ],
          ...(conn.label ? { label: { text: conn.label } } : {}),
        };
      })
      .filter(Boolean);

    const generatedElements = convertToExcalidrawElements([
      ...nodeSpecs,
      ...arrowSpecs,
    ]);

    const currentElements = excalidrawApi.getSceneElements();
    excalidrawApi.updateScene({
      elements: [...currentElements, ...generatedElements],
    });

    // The AI panel is a fixed 420px-wide overlay on the right — scroll/zoom
    // so the generated diagram centers in the remaining visible canvas,
    // not the full window width (which the panel partially covers)
    excalidrawApi.scrollToContent(generatedElements, {
      fitToContent: true,
      animate: true,
      viewportZoomFactor: 0.9, // small extra margin so nothing hugs the edges
    });

    // Nudge the view left after fitting, so content doesn't sit under the panel
    setTimeout(() => {
      const appState = excalidrawApi.getAppState();
      excalidrawApi.updateScene({
        appState: {
          ...appState,
          scrollX: appState.scrollX - 210, // roughly half the sidebar's width, in canvas units
        },
      });
    }, 50);

    placeholderPositionRef.current = null;
  };

  const currentTool = AiTools.find((t) => t.name === selectedTool);
  const charLimit = 500;

  return (
    <>
      <div
        className="fixed inset-0 z-[95] bg-black/10 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="absolute right-6 bottom-20 z-[100] w-[420px] overflow-hidden rounded-2xl border border-gray-100 bg-white/95 shadow-[0_24px_64px_rgba(67,56,202,0.2)] backdrop-blur-xl">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-[#EEF2FF] via-white to-[#FFF1F2] px-5 py-4">
          <div
            className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-[#818CF8]/15 blur-2xl"
            style={{ animation: "floatSlow 6s ease-in-out infinite" }}
          />
          <div
            className="relative z-10 flex items-start justify-between"
            style={{ animation: "fadeInUp 0.35s ease-out both" }}
          >
            <div className="flex items-start gap-3">
              <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4338CA] to-[#6366F1] text-white shadow-[0_6px_16px_rgba(67,56,202,0.35)]">
                {isGenerating && (
                  <span className="absolute inset-0 animate-ping rounded-xl bg-[#4338CA]/40" />
                )}
                <Sparkles size={18} className="relative z-10" />
              </div>
              <div>
                <h2 className="text-[17px] font-semibold text-gray-900">
                  AI Helper
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  {isGenerating
                    ? "Working on your diagram..."
                    : "Turn your ideas into visual content"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-gray-400 transition hover:bg-white hover:text-gray-700"
            >
              <X size={17} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* Tool grid — compact icon row, description reveals on hover/select */}
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
            What do you want to create?
          </h3>
          <div className="flex gap-2">
            {AiTools.map((tool, i) => {
              const Icon = tool.icon as unknown as LucideIcon;
              const isSelected = selectedTool === tool.name;
              return (
                <button
                  key={tool.name}
                  onClick={() => setSelectedTool(tool.name)}
                  title={tool.name}
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${i * 0.04}s both`,
                  }}
                  className={`group relative flex h-12 flex-1 cursor-pointer items-center justify-center rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? "border-transparent bg-gradient-to-br from-[#4338CA] to-[#6366F1] text-white shadow-[0_6px_16px_rgba(67,56,202,0.3)]"
                      : "border-gray-100 bg-white text-gray-400 hover:border-gray-200 hover:text-gray-600"
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={2}
                    className={
                      isSelected
                        ? "scale-110 transition-transform"
                        : "transition-transform group-hover:scale-110"
                    }
                  />
                </button>
              );
            })}
          </div>

          {/* Selected tool's name + description, swaps in below the row */}
          {currentTool && (
            <div
              key={currentTool.name}
              className="mt-3 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2"
              style={{ animation: "fadeInUp 0.2s ease-out both" }}
            >
              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-[#4338CA] to-[#6366F1]" />
              <div className="min-w-0">
                <span className="text-xs font-medium text-gray-700">
                  {currentTool.name}
                </span>
                <span className="text-xs text-gray-400">
                  {" "}
                  — {currentTool.desc}
                </span>
              </div>
            </div>
          )}

          <div className="my-5 h-px bg-gray-100" />

          {/* Input area */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-800">
                Describe your idea
              </h3>
              <WandSparkles
                size={17}
                strokeWidth={2}
                className="text-[#4338CA]"
              />
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50/70 transition focus-within:border-[#4338CA]/30 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#4338CA]/10">
              <Textarea
                placeholder="E.g. Create a customer onboarding flow with signup, email verification and subscription decision..."
                className="min-h-[100px] resize-none border-0 bg-transparent px-4 py-3 text-sm shadow-none outline-none focus-visible:ring-0"
                value={userInput}
                maxLength={charLimit}
                onChange={(event) => setUserInput(event.target.value)}
              />
              <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
                <span
                  className={`text-[11px] ${userInput.length > charLimit - 40 ? "text-amber-500" : "text-gray-300"}`}
                >
                  {userInput.length}/{charLimit}
                </span>
                <Button
                  onClick={onClickGenerate}
                  disabled={isGenerating || !userInput.trim()}
                  className="h-8 cursor-pointer gap-1.5 rounded-lg border-0 bg-gradient-to-r from-[#4338CA] to-[#6366F1] px-3 text-xs text-white shadow-[0_4px_12px_rgba(67,56,202,0.3)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                >
                  {isGenerating ? (
                    <>
                      <Loader2Icon size={13} className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate</span>
                      <ArrowUp size={13} strokeWidth={2} />
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Suggestion chips — quick-fill prompts specific to the selected tool */}
            {!userInput && SUGGESTIONS[selectedTool] && (
              <div
                className="mt-2.5 flex flex-wrap gap-1.5"
                style={{ animation: "fadeInUp 0.25s ease-out both" }}
              >
                {SUGGESTIONS[selectedTool].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setUserInput(suggestion)}
                    className="cursor-pointer rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] text-gray-500 transition hover:border-[#4338CA]/30 hover:bg-[#EEF2FF] hover:text-[#4338CA]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11px] text-gray-400">
              AI generated content can be edited afterwards
            </p>
            <div className="flex items-center gap-1 text-[11px] text-[#4338CA]">
              <Sparkles size={11} strokeWidth={2} />
              AI
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AIFloatingSidebar;
