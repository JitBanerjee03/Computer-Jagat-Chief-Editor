import { useContext, useEffect } from "react";
import { contextProviderDeclare } from "../store/ContextProvider";
import SubmittedJournalEmptyMessage from "../components/SubmittedJournalEmptyMessage";
import SubmittedJournal from "../components/SubmittedJournal";
import NotApprovedEmptyMessage from "../components/NotApprovedemptyMessage";

const SubmittedArticle=()=>{
    const {submittedJournal,fetchSubmittedJournal,isApproved}=useContext(contextProviderDeclare);

    useEffect(()=>{
        fetchSubmittedJournal();
    },[])
    
    console.log(submittedJournal);
    return (
        <>
            {isApproved===false ? <NotApprovedEmptyMessage/> : submittedJournal.length===0 ? <SubmittedJournalEmptyMessage/> : <SubmittedJournal submittedJournal={submittedJournal}/>}
        </>
    )
}

export default SubmittedArticle;