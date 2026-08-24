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
    desc: "Generate Diagrams in seconds",
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
    desc: "Turn ideas into visual workflows",
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
    desc: "Generate system architecture diagrams",
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
    desc: "Generate website wireframes and layouts",
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
    desc: "Generate mobile app wireframes",
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
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    cyan: "bg-cyan-50 text-cyan-600",
    pink: "bg-pink-50 text-pink-600",
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

  return (
    <>
      <div className="absolute right-6 bottom-20 z-[100] w-[420px] overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 backdrop-blur-xl shadow-2xl">
        <div className="border-b border-gray-100 bg-gradient-to-br from-violet-50/80 via-white to-blue-50/70 px-5 py-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 text-white shadow-sm">
                <Sparkles />
              </div>
              <div>
                <h2 className="text-[17px] font-semibold text-gray-900">
                  AI Helper
                </h2>
                <p className="mt-0.5 text-xs text-gray-500">
                  Turn your ideas into visual content
                </p>
              </div>
            </div>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 cursor-pointer">
              <X size={17} strokeWidth={2} />
            </button>
          </div>
        </div>

        <div className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500">
              What do you want to create?
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {AiTools.map((tool, index) => {
              const Icon = tool.icon as unknown as LucideIcon;
              const isSelected = selectedTool === tool.name;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedTool(tool.name)}
                  className={`group relative flex items-center gap-3 rounded-xl border p-3 text-left transition-all duration-200 cursor-pointer shadow-xs
                ${
                  isSelected
                    ? `border-violet-300 bg-violet-50/70`
                    : `border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm`
                }`}
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${COLOR_STYLES[tool.color]}`}
                  >
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-medium text-gray-800">
                      {tool.name}
                    </h2>
                    <h2 className="mt-0.5 truncate text-[11px] text-gray-400">
                      {tool.desc}
                    </h2>
                  </div>
                  {isSelected && (
                    <div className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-600" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="my-5 h-px bg-gray-100"></div>
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-800">
                  Describe your idea
                </h3>
                <p className="mt-0.5 text-xs text-gray-400">
                  AI will generate it directly on your canvas
                </p>
              </div>
              <WandSparkles
                size={17}
                strokeWidth={2}
                className="text-violet-500"
              />
            </div>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-50/70 transition focus-within:border-violet-300 focus-within:bg-white focus-within:ring-2 focus-within:ring-violet-100">
              <Textarea
                placeholder="E.g. Create a customer onboarding flow with signup, email verification and subscription decision..."
                className="min-h-[110px] resize-none border-0 bg-transparent px-4 py-3 text-sm shadow-none outline-none focus-visible:ring-0"
                onChange={(event) => setUserInput(event.target.value)}
              />
              <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
                <span className="rounded-md bg-white px-2 py-1 text-[11px] font-medium text-gray-500 shadow-sm ring-1 ring-gray-200">
                  {selectedTool}
                </span>
                <Button
                  onClick={onClickGenerate}
                  className="h-8 gap-1.5 rounded-lg bg-gray-900 px-3 text-xs text-white hover:bg-gray-800 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2Icon className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate</span>
                      <ArrowUp size={14} strokeWidth={2} />
                    </>
                  )}{" "}
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[11px] text-gray-400">
              AI generated content can be edited afterwards
            </p>
            <div className="flex items-center gap-1 text-[11px] text-gray-400">
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
