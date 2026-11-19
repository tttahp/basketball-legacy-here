import { createUser } from "./userManager.js";
import { saveUser, loadUser } from "./userDatabase.js";


const myPlayer = createUser({
    creation:{
        firstName:"John",
        lastName:"Smith",
        country:"USA",
        height:198,
        bodyType:"Athletic",
        position:"PG",
        dominantHand:"Right"
    }
});


saveUser(myPlayer);


const currentUser = loadUser();

console.log(currentUser);