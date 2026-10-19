import{createContext,useContext,useState}from"react";import{loginApi}from"../api/auth";
const C=createContext(null);
function roleFromJwt(t){try{return JSON.parse(atob(t.split(".")[1].replace(/-/g,"+").replace(/_/g,"/"))).role}catch{return null}}
export function AuthProvider({children}){const[token,setToken]=useState(localStorage.getItem("edupulse_token"));const[user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem("edupulse_user"))}catch{return null}});
async function login(username,password){const{data}=await loginApi({username,password});const token=typeof data==="string"?data:(data.token||data.jwt);if(!token)throw Error("No JWT token returned");const u={username,role:data.role||roleFromJwt(token)||"USER"};localStorage.setItem("edupulse_token",token);localStorage.setItem("edupulse_user",JSON.stringify(u));setToken(token);setUser(u)}
function logout(){localStorage.clear();setToken(null);setUser(null)}return <C.Provider value={{token,user,login,logout}}>{children}</C.Provider>}
export const useAuth=()=>useContext(C);