function setCookie(cname,cvalue,exdays){const d=new Date;let expires="";exdays>0?(d.setTime(d.getTime()+exdays*24*60*60*1e3),expires="expires="+d.toUTCString()):expires="expires=0",document.cookie=cname+"="+cvalue+";"+expires+";path=/"}function getCookie(cname){let name=cname+"=",ca=document.cookie.split(";");for(let i=0;i<ca.length;i++){let c=ca[i];for(;c.charAt(0)==" ";)c=c.substring(1);if(c.indexOf(name)==0)return c.substring(name.length,c.length)}return""}function checkCookie(cname){if(getCookie(cname)!="")return!1}var bar=document.getElementById("invx-announcement-bar"),dismiss=document.getElementById("invx-announcement-bar-dismiss");dismiss.addEventListener("click",function(){bar.style.display="none",setCookie("invx_dismiss_annc","1","")});
//# sourceMappingURL=/s/files/1/0558/6780/1757/t/19/assets/invx-global.js.map?v=1725103455

$('.rich-text__blocks p').each(function() {
	var words = $(this).text().split(" ");
    var maxWords = 6;
    
    if(words.length > maxWords){
        html = words.slice(0,maxWords) +'<span class="more_text" style="display:none;"> '+words.slice(maxWords, words.length)+'</span>' + '<a href="#" class="read_more">...<br/>[Read More]</a>'
    
        $(this).html(html)
    
    	$(this).find('a.read_more').click(function(event){
            $(this).toggleClass("less");
            event.preventDefault();
            if($(this).hasClass("less")){
            	$(this).html("<br/>[Read Less]")
                $(this).parent().find(".more_text").show();
            }else{
            	$(this).html("...<br/>[Read More]")
                $(this).parent().find(".more_text").hide();
            }
        })
    
    }
    
})

// Collection page paragraph toggle script

$(document).ready(function () {
    var content = $(".about-collection .metafield-rich_text_field p");
    var button = $(".about-collection .read-more");

    // Function to count words
    function wordCount(text) {
        return text.trim().split(/\s+/).length;
    }

    // Check if content has 50 words or less
    if (wordCount(content.text()) <= 50) {
        button.hide(); // Hide button if 50 words or less
    }
    $(".about-collection .read-more").click(function () {
        $(".about-collection").toggleClass("show");
        var button = $(this);
        button.text(button.text() === "SHOW MORE +" ? "SHOW LESS -" : "SHOW MORE +");
    });
});
