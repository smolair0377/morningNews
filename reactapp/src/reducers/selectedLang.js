export default function(selectedLang = null, action){
    if(action.type === 'resetStore'){
        return null
    }
    else if(action.type === 'changeLang'){
        return action.selectedLang
    } else {
        return selectedLang
    }
}