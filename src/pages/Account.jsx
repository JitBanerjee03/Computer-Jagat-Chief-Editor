import { useContext, useEffect, useState } from "react";
import { contextProviderDeclare } from "../store/ContextProvider"
import ChiefEditorProfile from "../components/ChiefEditorProfile";

const Account=()=>{
    const getContextObject=useContext(contextProviderDeclare);
    const {chiefEditor}=getContextObject;
    const [chiefEditorDetails,setChiefEditorDetails]=useState({});
    
    useEffect(()=>{
        if (!chiefEditor?.eic_id) return; //check if author is available before making the API call
        const getUserProfileDetails=async()=>{
            const chiefEditorResponse=await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/editor-chief/get-profile/${chiefEditor.eic_id}`,{
                method:"GET",
                headers:{
                    "content-type":"application/json"
                }
            })

            const chiefEditorData=await chiefEditorResponse.json();
            console.log(chiefEditorData);
            setChiefEditorDetails(chiefEditorData);
        }

        getUserProfileDetails();
    },[])
    
    return(
        <ChiefEditorProfile chiefEditor={chiefEditorDetails}/>
    )
}

export default Account;