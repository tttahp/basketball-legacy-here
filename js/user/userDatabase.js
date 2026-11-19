const USER_KEY = "BLA_USER_DATA";


export function saveUser(user) {
    localStorage.setItem(
        USER_KEY,
        JSON.stringify(user)
    );
}


export function loadUser() {
    const data = localStorage.getItem(USER_KEY);

    if (!data) return null;

    return JSON.parse(data);
}


export function deleteUser() {
    localStorage.removeItem(USER_KEY);
}


export function hasUser() {
    return localStorage.getItem(USER_KEY) !== null;
}