function setCookie(cname,cvalue,exdays){const d=new Date;let expires="";exdays>0?(d.setTime(d.getTime()+exdays*24*60*60*1e3),expires="expires="+d.toUTCString()):expires="expires=0",document.cookie=cname+"="+cvalue+";"+expires+";path=/"}function getCookie(cname){let name=cname+"=",ca=document.cookie.split(";");for(let i=0;i<ca.length;i++){let c=ca[i];for(;c.charAt(0)==" ";)c=c.substring(1);if(c.indexOf(name)==0)return c.substring(name.length,c.length)}return""}function checkCookie(cname){if(getCookie(cname)!="")return!1}var bar=document.getElementById("invx-announcement-bar"),dismiss=document.getElementById("invx-announcement-bar-dismiss");dismiss.addEventListener("click",function(){bar.style.display="none",setCookie("invx_dismiss_annc","1","")});
//# sourceMappingURL=/s/files/1/0558/6780/1757/t/19/assets/invx-global.js.map?v=1725103455
