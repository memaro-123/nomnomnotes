const Validate = (entryData)=> {
    console.log(entryData)
    if (entryData.name===""){
            alert("Must have a name!")
            return(false)
        }
    
        return(true)
}
export default Validate