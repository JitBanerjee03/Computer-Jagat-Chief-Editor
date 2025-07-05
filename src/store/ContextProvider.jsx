import { useEffect } from "react";
import { useReducer } from "react";
import { createContext, useState } from "react";

export const contextProviderDeclare=createContext({
    isloggedIn:Boolean,
    setLoggedIn:()=>{},
    chiefEditor:{},
    setChiefEditor:()=>{},
    getAcceptedJournals:()=>{},
    journals:[],
    submittedJournal:[],
    fetchSubmittedJournal:()=>{},
    areaEditors:[],
    fetchAllAreaEditors:()=>{},
    subjectAreasList:[],
    isApproved:Boolean,
});

const areaEditorReducer=(state,action)=>{
    return action.payload;   
}

export const ContextProvider=({children})=>{
    
    const [isloggedIn,setLoggedIn]=useState(false);
    const [chiefEditor,setChiefEditor]=useState({});
       
    const [journals,setJournals]=useState([]);
    
    const getAcceptedJournals=async()=>{
        const response=await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/journal/accepted-journals/`,{
            method:"GET",
            headers:{
                "content-type":"application/json"
            }
        })
    
        const data=await response.json();
        setJournals(data);
    }
    
    const [submittedJournal,setSubmittedJournal]=useState([]);

    const fetchSubmittedJournal=async()=>{
        const response=await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/journal/not-accepted-or-rejected/`,{
            method:"GET",
            headers:{
                "content-type":"application/json"
            }
        })

        const data=await response.json();
        setSubmittedJournal(data);
    }

    const [areaEditors,areaEditorDispatch]=useReducer(areaEditorReducer,[]);
    
    const fetchAllAreaEditors= async()=>{
        const response=await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/area-editor/get-all/`,{
            method:"GET",
            headers:{
                "content-type":"application/json"
            }
        })

        const data=await response.json();

        const areaEditorAction={
            type:"SET_AREA_EDITOR",
            payload:data
        }

        areaEditorDispatch(areaEditorAction);
    }
    
    const [subjectAreasList,setSubjectAreasList]=useState([]);
    
    const [isApproved,setApproved]=useState(false);

    useEffect(()=>{
        const fetchAllSubjectareas=async()=>{
            const response=await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/journal/subject-areas/`,{
                method:"GET",
                headers:{
                    "content-type":"application/json"
                }
            })

            const data=await response.json();

            setSubjectAreasList(data);
        }

        const urlParams = new URLSearchParams(window.location.search);

        if (urlParams.get('logout') === 'true') {
            localStorage.removeItem('jwtToken');
            window.close(); // Close the tab after clearing token
            console.log('Hello from the Reviewer !');
            return;
        }

        const urlToken = urlParams.get('token');
        const localToken = localStorage.getItem('jwtToken');

        if (urlToken && !localToken) {
            localStorage.setItem('jwtToken', urlToken);
            console.log('Reviewer: Token stored from URL parameter');
        }

        const token = urlToken || localToken;

        if (!token) {
            window.location.href = 'https://journal-management-system-frontend.vercel.app/login';
            return;
        }

        const checkTokenValidation = async () => {
            try {

                const response = await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/sso-auth/validate-token/`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setChiefEditor(data);
                    setLoggedIn(true);
                    setApproved(data.is_chief_editor_approved);

                    const approvalResponse=await fetch(`${import.meta.env.VITE_BACKEND_DJANGO_URL}/editor-chief/approval-status/${data.eic_id}/`,{
                        method:"GET",
                        headers:{
                            "content-type":"application/json"
                        }
                    });

                    const responseData=await approvalResponse.json();

                    setApproved(responseData.is_approved);
                } else {
                    localStorage.removeItem('token');
                    setLoggedIn(false);
                    window.location.href = 'https://journal-management-system-frontend.vercel.app/login';
                }
            } catch (error) {
                console.error("Token validation error:", error);
                localStorage.removeItem('token');
                setLoggedIn(false);
                window.location.href = 'https://journal-management-system-frontend.vercel.app/login';
            }
        };
        checkTokenValidation();
        fetchAllSubjectareas();
    },[])

    return (
        <contextProviderDeclare.Provider value={{isloggedIn,
        setLoggedIn,
        chiefEditor,
        setChiefEditor,
        getAcceptedJournals,
        journals,
        submittedJournal,
        fetchSubmittedJournal,
        areaEditors,
        fetchAllAreaEditors,
        subjectAreasList,
        isApproved
        }}>
            {children}
        </contextProviderDeclare.Provider>
    )
}


