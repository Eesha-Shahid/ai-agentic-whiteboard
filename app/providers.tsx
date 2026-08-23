"use client";
import { UserDetailContext } from "@/context/UserDetailContext";
import axios from "axios";
import React, { useEffect, useState } from "react";

function Providers({ children }: { children: React.ReactNode }) {
  const [userDetail, setUserDetail] = useState<any>();

  useEffect(() => {
    CreateNewUser();
  }, [])

  const CreateNewUser = async() => {
    const result = await axios.post("/api/users");
    setUserDetail(result.data);
  }

  return(
    <UserDetailContext value={{ userDetail, setUserDetail }}>
      <div>{children}</div>
    </UserDetailContext>
  )
}

export default Providers;
