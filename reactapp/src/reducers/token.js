export default function(token = '', action){
    if(action.type === 'resetStore'){
        return ''
    }
    else if(action.type === 'addToken'){
        return action.token
    } else {
        return token
    }
}