function resize_lineups_boxes(){

}

base_path = 'https://lineupsvalorant.com'
if (window.location.hostname == '127.0.0.1'){
    base_path = ''
}

if (window.location.pathname == '/saved'){//if we're on the saved page then we know the lineup is saved
    saved_icon = base_path+"/static/ui_icons/saved.svg"
    saved_text = 'Unsave Lineup'
}
else{
    saved_icon = base_path+"/static/ui_icons/save.svg"
    saved_text = 'Save Lineup'
}

//darken effect around the menu on mobile
a = document.createElement('DIV');
a.setAttribute('id','lineup_box_options_mobile_bg')
document.body.appendChild(a);

temp_html = ''
if (localStorage.getItem('user_token') != null){
    temp_html = `<div id='lineup_box_like_option' onclick='like_lineup_box(this.parentNode.dataset.id,this.parentNode.dataset.type)'>
                    <img src='${base_path}/static/ui_icons/like.svg'><span>Like Lineup</span>
                </div>
                <div id='lineup_box_edit_option' class='hidden_lineup_box_option' onclick='edit_lineup_box(this.parentNode.dataset.id,this.parentNode.dataset.type)'>
                    <img src='${base_path}/static/ui_icons/edit.svg'>Edit Lineup
                </div>   
                <div id='lineup_box_delete_option' class='hidden_lineup_box_option' onclick="delete_lineup_box(this.parentNode.dataset.id,this.parentNode.dataset.type)">
                    <img src='${base_path}/static/ui_icons/delete.svg'>Delete Lineup
                </div>          
            `
}

// "<div class='viewer_desktop_options' id='viewer_delete' style='display:none' onclick=\"document.getElementById(\'delete_lineup_confirmation\').classList.remove(\'hidden\')\"><img src='/static/ui_icons/delete.svg'>Delete</div>"+

a = document.createElement('DIV');
a.setAttribute('id','lineup_box_options')
a.innerHTML = `<div onclick='share_lineup(this.parentNode.dataset.id,this.parentNode.dataset.type)'><img src='${base_path}/static/ui_icons/copy.svg'>Copy Link</div>
    <div onclick='save_lineup_box(this.parentNode.dataset.id,this.parentNode.dataset.type)'><img id='lineup_box_save_option_img' src='${saved_icon}'><span id='lineup_box_save_option_text'>${saved_text}</span></div>
    ${temp_html}
`
document.body.appendChild(a);


function create_lineup(data,type='lineup',overlay=false){//creates the div in which the results passed is held
    if (type == 'lineup'){
        // console.log(data)
        if (data[0]){
            map = data[0]
            title = data[1]
            start = data[2]
            end = data[3]
            abilities_names = data[4]
            id = data[5]
            num_images = data[6]
        }
        else{
            map = data['map']
            title = data['title']
            start = data['start']
            end = data['end']
            abilities_names = data['abilities']
            id = data['id']
            num_images = data['num_images']
        }
        
        if (num_images == undefined){
            num_images = 1;
        }
        agent = find_agent(abilities_names[0].replace('/','_'));

        thumbnail_path = '/lineup_images_thumbnail/'+id+'/'+num_images+'.webp'
    }
    else{
        map = data['map']
        title = data['title']
        start = data['position']
        end = data['position']
        id = data['id']
        abilities_names = []
        for (h=0;h<data['abilities'].length;h++){
            abilities_names.push(data['abilities'][h]['ability'])
        }

        agent = find_agent(abilities_names[0].replaceAll('/','_'));

        thumbnail_path = '/setup_images/'+id+'/thumbnail.webp'
    }
	

    ability_html = ''
    for (h=0;h<abilities_names.length;h++){
        temp = abilities_names[h].replace('/','_')
        ability_html += "<img alt='VALORANT "+temp+"' src='"+base_path+"/static/abilities/"+temp+".webp' loading='lazy'>"
    }

    link1 = "/?map="+map+"&start="+start
    link2 = "/?map="+map+"&end="+end
    clickcode = ''
    hidemoreoptions = ''
    if (overlay){
        link1 = ''
        link2 = ''
        clickcode = 'event.preventDefault()'
        hidemoreoptions = 'display:none'
    }

    if (start == end){
        position_text = "For <a onclick='window.event.stopPropagation();"+clickcode+"' href='"+link1+"'>"+start+"</a>"
    }
    else{
        position_text = "From <a onclick='window.event.stopPropagation();"+clickcode+"' href='"+link1+"'>"+start+"</a> to <a onclick='window.event.stopPropagation();"+clickcode+"' href='"+link2+"'>"+end+"</a>"
    }
    
    a = document.createElement('a');
    if (type == 'lineup') {
        a.setAttribute('href','/?id='+id)
    }
    else {
        a.setAttribute('href','/?setup='+id)
    }
    a.setAttribute('class','lineup-box');
    a.setAttribute('rel','nofollow')
	a.setAttribute('tabindex','0');
    a.setAttribute('data-id',id)
    a.setAttribute('data-type',type)
	a.innerHTML = "<div class='lineups-box-image-div'>"+
						"<img loading='lazy' alt='lineup image' class='lineup-box-image' src='"+base_path+"/static"+thumbnail_path+"'>"+
						"<div class='lineup-box-darken'></div>"+
                        "<div class='lineup-box-abilities'>"+ability_html+"</div>"+
						"<img loading='lazy' class='lineup-box-agent' alt='"+agent+"' src='"+base_path+"/static/agents/"+agent+".webp'>"+
					"</div>"+
					"<div class='lineup-box-text'>"+
                        "<span class='lineup-box-title'>"+title+"</span><br>"+
                        "<span class='lineup-box-position'>"+position_text+"</span>"+
                        "<div style='"+hidemoreoptions+"' onclick='event.preventDefault();show_box_more_options(event,this)' data-id='"+id+"' data-type='"+type+"' class='lineup_box_options_parent'>"+
                            "<img src='"+base_path+"/static/ui_icons/more_dots.png' alt='more options'>"+
                        "</div>"+
					"</div>"
    
    if (type == 'lineup'){
        a.setAttribute('onclick','event.preventDefault();this.blur();open_lineup('+id+')');
    }
    else{
        a.setAttribute('onclick','event.preventDefault();this.blur();open_setup('+id+')');
    }

	return a;
}



function show_box_more_options(e,el){
	e.stopPropagation();
    document.getElementById('lineup_box_options').dataset.id = el.dataset.id;
    document.getElementById('lineup_box_options').dataset.type = el.dataset.type;

    if (window.innerWidth > 500){
        document.getElementById('lineup_box_options').style.left = 'calc('+el.getBoundingClientRect().x+'px - 14rem + 2em)'
        document.getElementById('lineup_box_options').style.top = 'calc('+(el.getBoundingClientRect().y+window.pageYOffset)+'px + 2em)'
    }
    else{
        document.getElementById('lineup_box_options').style.left = ''
        document.getElementById('lineup_box_options').style.top = ''
        document.getElementById('lineup_box_options_mobile_bg').style.display = 'block'
    }

    document.getElementById('lineup_box_save_option_img').src = base_path+'/static/ui_icons/save.svg'
    document.getElementById('lineup_box_save_option_text').innerText = 'Save Lineup'

    els = document.querySelector('.hidden_lineup_box_option:not(.hidden)')
    while (els){
        els.classList.add('hidden')
        els = document.querySelector('.hidden_lineup_box_option:not(.hidden)')
    }

    if (localStorage.getItem('user_token') != null){
        httpPostAsync('/saved',function(data){
            data = JSON.parse(data);
            document.getElementById('lineup_box_options').style.display = 'block';
            if (data['state'] == 'done'){
                if (data['saved'] == true){
                    document.getElementById('lineup_box_save_option_img').src = base_path+'/static/ui_icons/saved.svg'
                    document.getElementById('lineup_box_save_option_text').innerText = 'Unsave Lineup';
                }
                else{
                    document.getElementById('lineup_box_save_option_img').src = base_path+'/static/ui_icons/save.svg'
                    document.getElementById('lineup_box_save_option_text').innerText = 'Save Lineup'
                }

                if (data['liked'] == true){
                    document.querySelector('#lineup_box_like_option > img').src = base_path+'/static/ui_icons/liked.svg'
                    document.querySelector('#lineup_box_like_option > span').innerText = 'Unlike Lineup';
                }
                else{
                    document.querySelector('#lineup_box_like_option > img').src = base_path+'/static/ui_icons/like.svg'
                    document.querySelector('#lineup_box_like_option > span').innerText = 'Like Lineup'
                }

                if (data['owner']){
                    el = document.querySelector('.hidden_lineup_box_option.hidden')
                    while (el){
                        el.classList.remove('hidden')
                        el = document.querySelector('.hidden_lineup_box_option.hidden')
                    }
                }
            }
        },{'request-type':'check-saved','user_token':localStorage.getItem('user_token'),'id':el.dataset.id,'type':el.dataset.type})
    }
    else{
        document.getElementById('lineup_box_options').style.display = 'block';

        //check if the lineup is saved
        id = el.dataset.id
        document.getElementById('lineup_box_save_option_img').src = base_path+'/static/ui_icons/save.svg'
        document.getElementById('lineup_box_save_option_text').innerText = 'Save Lineup'
        temp = localStorage.getItem('saved');
        if (temp != null){
            temp = temp.split(',');
            temp1 = localStorage.getItem('saved_type').split(',');
            for (n=0;n<temp.length;n++){
                if (temp[n] == id && temp1[n] == el.dataset.type){											
                    document.getElementById('lineup_box_save_option_img').src = base_path+'/static/ui_icons/saved.svg'
                    document.getElementById('lineup_box_save_option_text').innerText = 'Unsave Lineup'
                }
            }
        }
    }
    document.getElementById('lineup_box_options').style.display = 'block';
}

function close_lineup_box_options(){
    document.getElementById('lineup_box_options').style.display = ''
    document.getElementById('lineup_box_options_mobile_bg').style.display = ''
}

function save_lineup_box(id,type='lineup'){
	state = save_lineup(id,type);
    if (state == true){
        document.getElementById('lineup_box_save_option_img').src = base_path+'/static/ui_icons/saved.svg'
        document.getElementById('lineup_box_save_option_text').innerText = 'Unsave Lineup'
    }
    else{
        document.getElementById('lineup_box_save_option_img').src = base_path+'/static/ui_icons/save.svg'
        document.getElementById('lineup_box_save_option_text').innerText = 'Save Lineup'
    }
}

function like_lineup_box(id,type='lineup'){
	state = like_lineup(id,type);
    if (state == true){
        document.querySelector('#lineup_box_like_option > img').src = base_path+'/static/ui_icons/liked.svg'
        document.querySelector('#lineup_box_like_option > span').innerText = 'Unlike Lineup'
    }
    else{
        document.querySelector('#lineup_box_like_option > img').src = base_path+'/static/ui_icons/like.svg'
    }
}

function edit_lineup_box(id,type='lineup'){
    if (type == 'lineup'){
        window.location.href = '/editor?id='+id
    }
    else{
        window.location.href = '/setup-editor?id='+id
    }
}


function delete_lineup_box(id,type='lineup'){
    document.getElementById('viewer_full').dataset.id = id;
    document.getElementById('viewer_full').dataset.type = type;
    document.getElementById('delete_lineup_confirmation').classList.remove('hidden')
}

function find_agent(ability){//finds which agent relates to the inputted ability
    for (j=0;j<setup_abilities.length;j++){
        for (n=0;n<setup_abilities[j].length;n++){//loops through all abilities
            ability_name = ''
            for (h=0;h<setup_abilities[j][n].length;h++){//remove / from selected ability name
                if (setup_abilities[j][n][h] != '/'){
                    ability_name += setup_abilities[j][n][h]
                }
                else{ability_name += '_'}
            }
            if (ability == ability_name){
                agent = setup_agents[j]
                return agent;
            }
        }
    }

    //in case it isnt a setup abnility but is a lineup one
    for (j=0;j<abilities.length;j++){
        for (n=0;n<abilities[j].length;n++){//loops through all abilities
            ability_name = ''
            for (h=0;h<abilities[j][n].length;h++){//remove / from selected ability name
                if (abilities[j][n][h] != '/'){
                    ability_name += abilities[j][n][h]
                }
                else{ability_name += '_'}
            }
            if (ability == ability_name){
                agent = agents[j]
                return agent;
            }
        }
    }
    return 'Breach';
}

document.addEventListener("click", close_lineup_box_options);