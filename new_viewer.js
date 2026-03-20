//set up viewer data for first tiem visit
if (!localStorage.getItem('viewer_data')){
    localStorage.setItem('viewer_data',JSON.stringify({
        'collapse_overview':true,
        'pin_overview':false
    }))
}


bg_dim = document.createElement('div');
bg_dim.setAttribute('id','viewer_background');
bg_dim.setAttribute('onclick','close_viewer()')

viewer_container = document.createElement('div');
viewer_container.setAttribute('id','viewer_container');

full_viewer = document.createElement('div');
full_viewer.setAttribute('id','viewer_full');
full_viewer.setAttribute('data-click_interval',new Date().getTime());
full_viewer.onclick = function(e){
    if (new Date().getTime() - document.getElementById('viewer_full').dataset.click_interval < 500){
        like_lineup(document.getElementById('viewer_full').dataset.id,document.getElementById('viewer_full').dataset.type,show_animation=true)
    }
    document.getElementById('viewer_full').dataset.click_interval = new Date().getTime()
    e.stopPropagation();
}

image = document.createElement('div');
image.setAttribute('id','viewer_image_div');

image.innerHTML = "<img src='' id='viewer_image' style='display:none'>"+
                        "<div id='viewer_image_buttons' style='display:none;'>"+
                        "<img src='/static/ui_icons/back.png' id='viewer_image_back' onclick='previous_image()' style='display:none;' title='Previous image'>"+
                        "<img src='/static/ui_icons/forward.png' id='viewer_image_next' onclick='next_image()'  title='Next image'>"+
                        "<img src='/static/ui_icons/liked.svg' id='viewer_like_animation'>"+
                    "</div>"+
                    "<div id='viewer_loading'>"+
									"<div style='left:50%;top:50%;width:16.5rem;height:calc(100px + 3rem);position:relative;transform:translate(-50%, -80%);'>"+
									"<div class='loading-dots' style='animation:mymove 1.1s 0s infinite linear;	left:0px;'></div>"+
									"<div class='loading-dots' style='animation:mymove 1.1s 0.1s infinite linear;left:4.5rem;'></div>"+
									"<div class='loading-dots' style='animation:mymove 1.1s 0.2s infinite linear;left:9rem;'></div>"+
									"<div class='loading-dots' style='animation:mymove 1.1s 0.3s infinite linear;left:13.5rem;'></div></div>"

title = document.createElement('DIV');
title.setAttribute('id','viewer_title');
title.innerHTML = "<img src='/static/ui_icons/back_material.png' onclick='close_viewer()' id='viewer_back_button'>"+
                    "<div id='viewer_title_text'></div>"+
                    "<img src='/static/ui_icons/close.png' onclick='close_viewer()' id='viewer_close'>"

settings = JSON.parse(localStorage.getItem('viewer_data'))
overview = document.createElement('DIV');
overview.setAttribute('id','viewer_image_overview_parent');
overview_image = 'collapse'
overview_title = 'Expand image overview'
overview_text = 'Show'
if (settings['collapse_overview'] == false){
    overview.setAttribute('class','open')
    overview_image = 'expand'
    overview_title = 'Collapse image overview'
    overview_text = 'Hide'
}
image_name = 'pin'
pin_title = 'Pin image overview'
if (settings['pin_overview'] == true){
    overview.setAttribute('class','open pinned')
    image_name = 'pinned'
    pin_title = 'Unpin image overview'
}
overview.innerHTML = `
    <div id='viewer_image_overview'></div>
    <div id='viewer_image_overview_options'>
        <div id='viewer_image_counter'><span id='viewer_current_image'></span>/<span id='viewer_max_image'></span></div>
        <img src='/static/ui_icons/${image_name}.svg' title='${pin_title}' onclick='change_image_overview_pin()' id='viewer_image_overview_pin'>
        <img src='/static/ui_icons/${overview_image}.svg' title='${overview_title}' onclick='change_image_overview_collapse()' id='viewer_image_overview_expand'>
    </div>
`

like_html = ''
if (localStorage.getItem('user_token') != null){
    like_html = "<img src='/static/ui_icons/like.svg' onclick=\"like_lineup(document.getElementById('viewer_full').dataset.id,document.getElementById('viewer_full').dataset.type)\" id='viewer_like'><span id='viewer_like_count' class='viewer_metric'></span>"
}

description = document.createElement('DIV');
description.setAttribute('id','viewer_description');
description.innerHTML = "<div id='viewer_steps_title'>Steps</div><div id='viewer_description_text'></div>"+       
                            "<div id='viewer_translation_wrapper'>"+
                                "<span id='viewer_translation_message'>This lineup has been automatically translated. </span>"+
                                "<span id='viewer_translation_button' onclick='swap_translation()'>View original</span>"+
                            "</div>"+                     
                            "<div id='viewer_description_options'>"+
                                like_html+
                                "<img src='/static/ui_icons/share.svg' onclick='share_lineup()' id='viewer_share' title='Share'>"+
                                "<img src='/static/ui_icons/save.svg' onclick='save_lineup()' id='viewer_save' title='Save/Unsave'><span id='viewer_save_count' class='viewer_metric'></span>"+
                                "<span id='viewer_more_option_desktop'>"+
                                    "<img src='/static/ui_icons/more_dots.png' onclick='show_viewer_more_options()'>"+
                                    "<div id='viewer_more_options_popup_desktop'>"+
                                        "<div class='viewer_desktop_options' onclick=\"document.getElementById(\'report_lineup_confirmation\').classList.remove(\'hidden\')\"><img src='/static/ui_icons/report.svg'>Report</div>"+
                                        "<div class='viewer_desktop_options' onclick=\"change_image_overview_collapse()\"><img src='/static/ui_icons/overview.svg'><span id='viewer_overview_desktop'>"+overview_text+" Overview</span></div>"+
                                        "<div class='viewer_desktop_options' id='viewer_edit' style='display:none' onclick=\"window.location.href = '/editor?id='+document.getElementById('viewer_full').dataset.id\"><img src='/static/ui_icons/edit.svg'>Edit</div>"+
                                        "<div class='viewer_desktop_options' id='viewer_delete' style='display:none' onclick=\"document.getElementById(\'delete_lineup_confirmation\').classList.remove(\'hidden\')\"><img src='/static/ui_icons/delete.svg'>Delete</div>"+
                                        "<div class='viewer_desktop_options' id='viewer_unlist' style='display:none' onclick='unlist_lineup()'><img src='/static/ui_icons/listed.svg'><span id='viewer_desktop_unlist'>Unlist</span></div>"+
                                    "</div>"+
                                "</span>"+
                            "</div>"+
                            "<a href='/' id='viewer_owner_link'>"+
                                "<img alt='User Profile Picture' src=''>"+
                                "<div>Uploaded by<br><span id='viewer_username_text'></span><img id='verified_desc' src='/static/ui_icons/verified.svg' style='display: none;vertical-align: middle;'> <span id='viewer_upload_date'></span></div>"+
                            "</a>"+
                            "<div id='viewer_unlisted_alert'><img style='height:1.5em;vertical-align:middle;' src='/static/ui_icons/alert.svg'>"+
                            "This lineup is unlisted so might not work anymore or is currently under review.</div>"+
                            "<div id='viewer_description_abilities'></div>"


full_viewer.appendChild(image);
full_viewer.appendChild(title);
full_viewer.appendChild(description);
full_viewer.appendChild(overview);

viewer_container.appendChild(full_viewer);
bg_dim.appendChild(viewer_container);
document.body.appendChild(bg_dim);

//create the mobile options menu
options_bg = document.createElement('div');
options_bg.setAttribute('id','viewer_options_bg');
options_bg.setAttribute('style','display:none');
options_bg.onclick = close_viewer_options

options = document.createElement('div');
options.setAttribute('id','viewer_options');
options.onclick = function(e){
    e.stopPropagation()
}

// share_option = document.createElement('div');
// share_option.setAttribute('class','viewer_option')
// share_option.setAttribute('onclick','share_lineup()')
// share_option.innerHTML = "<img src='/static/ui_icons/share.svg'>Share";

// save_option = document.createElement('div');
// save_option.setAttribute('class','viewer_option')
// save_option.setAttribute('onclick','save_lineup()')
// save_option.innerHTML = "<img id='viewer_save_options_icon' src='/static/ui_icons/save.svg'><span id='viewer_save_options'>Save</span>";

edit_option = document.createElement('div');
edit_option.setAttribute('class','viewer_option')
edit_option.setAttribute('onclick',"window.location.href = '/editor?id='+document.getElementById('viewer_full').dataset.id");
edit_option.setAttribute('style','display:none;')
edit_option.setAttribute('id','viewer_edit_option')
edit_option.innerHTML = "<img src='/static/ui_icons/edit.svg'>Edit";

delete_option = document.createElement('div');
delete_option.setAttribute('class','viewer_option');
delete_option.setAttribute('onclick',"document.getElementById('delete_lineup_confirmation').classList.remove('hidden')");
delete_option.setAttribute('style','display:none;');
delete_option.setAttribute('id','viewer_delete_option')
delete_option.innerHTML = "<img src='/static/ui_icons/delete.svg'>Delete";

list_option = document.createElement('div');
list_option.setAttribute('class','viewer_option');
list_option.setAttribute('onclick',"unlist_lineup()");
list_option.setAttribute('style','display:none;');
list_option.setAttribute('id','viewer_list_option')
list_option.innerHTML = "<img id='viewer_unlist_options_icon' src='/static/ui_icons/listed.svg'><span id='viewer_unlist_options_text'>Unlist</span>";

report_option = document.createElement('div');
report_option.setAttribute('class','viewer_option');
report_option.setAttribute('onclick',"document.getElementById('report_lineup_confirmation').classList.remove('hidden')");
report_option.setAttribute('id','viewer_report_option')
report_option.innerHTML = "<img src='/static/ui_icons/report.svg'>Report";

overview_option = document.createElement('div');
overview_option.setAttribute('class','viewer_option');
overview_option.setAttribute('onclick',"close_viewer_options();change_image_overview_collapse()");
overview_option.innerHTML = "<img src='/static/ui_icons/overview.svg'><div id='viewer_overview_text'>"+overview_text+" overview</div>";

// options.appendChild(share_option);
// options.appendChild(save_option);
options.appendChild(edit_option);
options.appendChild(delete_option);
options.appendChild(list_option);
options.appendChild(report_option);
options.appendChild(overview_option);

options_bg.appendChild(options);
document.body.appendChild(options_bg);

//asdd the drag listeners to the image_buttons div
document.getElementById('viewer_image_buttons').ontouchstart = function(e){
    document.getElementById('viewer_image_buttons').dataset.mousex = e.touches[0].clientX;
    document.getElementById('viewer_image_buttons').dataset.mousey = e.touches[0].clientY;
}

document.getElementById('viewer_image_buttons').ontouchend = function(e){
    if (document.getElementById('viewer_image_buttons').dataset.mousex-e.changedTouches[0].clientX > window.innerWidth*0.4){
        next_image();
    }
    else if (e.changedTouches[0].clientX-document.getElementById('viewer_image_buttons').dataset.mousex > window.innerWidth*0.4){
        previous_image();
    }
}

//delete lineup confirmation			
create_popup('Confirm Delete','This action is permanent and cannot be undone. Are you sure you want to continue?',
        [{'text':'Cancel','function':function(){
                                        delete_lineup(false)
                                    },
        'filled':false},
        {'text':'Delete Forever','function':function(){
                                        delete_lineup(true)
                                    },
        'filled':true}],id='delete_lineup_confirmation',hidden=true)



//report lineup confirmation			
create_popup('Report Lineup or Setup',"Please select a reason why you are reporting this lineup/setup<div style='border:2px solid var(--primary-bg);padding:0.5em; border-radius:0.3em'>"+
    "<div><input type='checkbox' id='report_option_description' class='report_option'><label for='report_option_description'>Description is unclear</label></div>"+
    "<div><input type='checkbox' id='report_option_new_map' class='report_option'><label for='report_option_new_map'>No longer works due to map change</label></div>"+
    "<div><input type='checkbox' id='report_option_ability' class='report_option'><label for='report_option_ability'>Doesnt work for the provided abilities</label></div>"+
    "<div><input type='checkbox' id='report_option_images' class='report_option'><label for='report_option_images'>Unclear images</label></div>"+
    "<div><input type='checkbox' id='report_option_not_work' class='report_option'><label for='report_option_not_work'>Lineup/setup does not work</label></div>"+
    "<div><input type='checkbox' id='report_option_location' class='report_option'><label for='report_option_location'>Start/end callout is incorrect</label></div>"+
    "<div><input type='checkbox' id='report_option_language' class='report_option'><label for='report_option_language'>Harmful language</label></div>"+
    "<div><input type='checkbox' id='report_option_other' class='report_option'><label for='report_option_other'>Other</label></div>"+
    "Comment (optional)<br>"+
    "<textarea id='viewer_report_comment'></textarea></div>",
        [{'text':'Cancel','function':function(){
                                        report_lineup(false)
                                    },
        'filled':false},
        {'text':'Report','function':function(){
                                        report_lineup(true)
                                    },
        'filled':true}],id='report_lineup_confirmation',hidden=true)


var setup_images = []
var setup_descriptions = {}
var setup_alt_descriptions = {}

function insert_description_links(description){
    description = description.replaceAll('</link>','</a>'); 
    link_string = '<link id='
    let temp = '';
    for (k=0;k<description.length;k++){
        fail = true;
        if (description[k] == '<'){
            fail = false;
            repeats = description.length-k
            if (link_string.length < repeats){
                repeats = link_string.length
            }
            for (n=0;n<repeats;n++){
                if (description[n+k] != link_string[n]){
                    fail = true;
                }
            }
            if (fail == false){
                g = 0;
                num = '';
                while (isNaN(description[k+n+g]) == false){
                    num += description[k+n+g];
                    g += 1
                }
                k = k+link_string.length+g;
                temp += "<a href='/?id="+num+"' onclick='window.event.preventDefault();open_lineup("+num+")'>"
            }
        }
        if (fail == true){
            temp += description[k]
        }
    }
    temp = temp.replaceAll("'",'\"')
    return temp;
}

function load_lineup_data(id){  
    apply_viewer_settings()
    document.getElementById('viewer_image_overview').innerHTML = ''
    document.querySelector('#viewer_upload_date').innerHTML = ''
    document.getElementById('viewer_image_overview_parent').style.display = 'none'
    user_token = localStorage.getItem('user_token')
    httpPostAsync('/get_lineup',function(data){
        data = JSON.parse(data);
        if (data['unlocked_pfp'] != undefined){//if the user has unlocked a pfp
            update_notifications()
        }
        loaded_lineup_data(data);
    },{'id':id, 'user_token':user_token})

    //check if the lineup is saved already
    if (localStorage.getItem('user_token') == null){///if the user isnt logged in
		saved_lineups = localStorage.getItem("saved")
        saved_type = localStorage.getItem("saved_type")
		if (saved_lineups != null){
			saved_lineups = saved_lineups.split(',');
            saved_type = saved_type.split(',');
			for (i=0;i<saved_lineups.length;i++){
				if (saved_lineups[i] == id && saved_type[i] == 'lineup'){//if the lineup is saved
					document.getElementById('viewer_save').src = '/static/ui_icons/saved.svg';
				}
			}
		}
		if (saved_lineups == null){
			saved_lineups = [];
		}
	}
	else{
        httpPostAsync('/saved',function(data){
            data = JSON.parse(data);
            if (data['saved'] == true){//if the lineup is saved
                document.getElementById('viewer_save').src = '/static/ui_icons/saved.svg';
            }
            if (data['liked'] == true){//if the lineup is liked
                document.getElementById('viewer_like').src = '/static/ui_icons/liked.svg';
            }
        },{'user_token':localStorage.getItem('user_token'),'id':id,'request-type':'check-saved','type':'lineup'})
    }
    document.getElementById('viewer_full').dataset.id = id;//store the lineup id
    document.getElementById('viewer_full').dataset.type = 'lineup';
    document.getElementById('viewer_background').style.display = 'flex';

    if (window.event){
        multiplier = 0.2
        if (window.innerWidth < 500){
            multiplier = 0
        }
        document.getElementById('viewer_full').style.transformOrigin = (window.event.clientX-window.innerWidth*multiplier)+'px '+(window.event.clientY-window.innerHeight*multiplier)+'px'
    }
    else{
        document.getElementById('viewer_full').style.transformOrigin = '50% 50%'
    }    

    if (window.innerWidth <= 1100){
        document.getElementById('viewer_full').style.width = '80vw'
    }
    if (window.innerWidth <= 500){
        document.getElementById('viewer_full').style.width = '100vw';//set the loading animation to be 100%
        document.getElementById('viewer_title').style.display = 'flex';//show the back button
        document.getElementById('viewer_title_text').innerHTML = 'Back'//reset the title
    }
    document.getElementById('viewer_description_abilities').style.display = ''
    resize_viewer()
}

function loaded_lineup_data(data){
    if (data['error'] == 'none' && document.getElementById('viewer_background').style.display != 'none'){//if we dont need to redirect and havent closed the viewer
        //replace all the link 'code' with actual link code
        description = data['description'].replaceAll('&lt;br&gt;','<br>')
        data['description'] = insert_description_links(description);
        data['abilities'] = data['abilities'].split(':');
        set_viewer_upload_date(data['date_uploaded'])

        agent = find_agent(data['abilities'][0]);
        if (data['translated_description']){
            data['translated_description'] = insert_description_links(data['translated_description']);
            document.getElementById('viewer_description_text').innerHTML = data['translated_description'];
            document.getElementById('viewer_title_text').innerHTML = data['translated_title'];
            document.getElementById('viewer_full').dataset.alternate_description = data['description']
            document.getElementById('viewer_full').dataset.alternate_title = data['title'];
            document.getElementById('viewer_translation_wrapper').style.display = 'block'
            document.getElementById('viewer_translation_message').style.display = ''
            document.getElementById('viewer_translation_button').innerHTML = 'View original'
        }
        else{
            document.getElementById('viewer_description_text').innerHTML = data['description'];
            document.getElementById('viewer_title_text').innerHTML = data['title'];
            document.getElementById('viewer_translation_wrapper').style.display = ''
        }
        document.getElementById('viewer_description_abilities').innerHTML = '';
        document.querySelector('#viewer_owner_link > img').src = '/static/profile_pictures/'+data['profile_pic']
        document.getElementById('viewer_username_text').innerHTML = data['username']
        document.getElementById('viewer_owner_link').href = '/profile/'+data['username']
        
        // Update like and save counts
        if (document.getElementById('viewer_like_count')) {
            document.getElementById('viewer_like_count').dataset.value = data['like_count'] || '';
        }
        if (document.getElementById('viewer_save_count')) {
            document.getElementById('viewer_save_count').dataset.value = data['save_count'] || '';
        }

        a = document.createElement('img');
        a.src = '/static/agents/'+agent+'.webp'
        document.getElementById('viewer_description_abilities').appendChild(a);
        if (data['unlisted'] == 1){
            document.getElementById('viewer_unlisted_alert').style.display = 'block'
        }

        for (i=0;i<data['abilities'].length;i++){
            if (i == 1){
                // a = document.createElement('img');
                // a.src = '/static/abilities/or.webp';
                a = document.createElement('DIV');
                a.innerHTML = 'or'
                document.getElementById('viewer_description_abilities').appendChild(a);
            }
            a = document.createElement('img');
            a.src = '/static/abilities/'+data['abilities'][i]+'.webp';
            document.getElementById('viewer_description_abilities').appendChild(a);
        }

        loadFunction = function(){
            if (window.innerWidth <= 1100){
                document.getElementById('viewer_full').style.width = ''
                document.getElementById('viewer_full').style.height = ''
            }
            document.getElementById('viewer_image_buttons').style.display = '';
            document.getElementById('viewer_image').style.display = 'block';
            document.getElementById('viewer_loading').style.display = 'none';
            document.getElementById('viewer_image_overview_parent').style.display = ''//show the overview
            resize_viewer()
            if (window.viewerImageLoad){
                clearInterval(window.viewerImageLoad)
            }
        }
        document.getElementById('viewer_image').onload = loadFunction
        document.getElementById('viewer_image').onerror = () => {
            url = document.getElementById('viewer_image').src.split('?')
            url[1] = url[1] ? url[1]+'1' : 'refresh=1'
            if (url[1].split('=')[1].length < 10){
                document.getElementById('viewer_image').src = url[0] + '?' + url[1]
            }
        }
        document.getElementById('viewer_image').src = '/static/lineup_images/'+data['lineup_id']+'/1.webp'

        document.getElementById('viewer_max_image').innerHTML = data['images'];
        document.getElementById('viewer_current_image').innerHTML = '1';

        document.getElementById('viewer_description').style.display = 'flex';
        document.getElementById('viewer_title').style.display = 'flex';

        if (localStorage.getItem('username') == data['username']){//if the user owns the lineup NOTE:while this check is done client side a check is done again server side when the action is clicked
            document.getElementById('viewer_edit').style.display = '';
            document.getElementById('viewer_delete').style.display = '';
            document.getElementById('viewer_unlist').style.display = '';
            document.getElementById('viewer_edit_option').style.display = 'flex';
            document.getElementById('viewer_delete_option').style.display = 'flex';
            document.getElementById('viewer_list_option').style.display = 'flex';

            //make the edit buttons edit lineup not setup
            document.getElementById('viewer_edit').setAttribute('onclick',"window.location.href = '/editor?id='+document.getElementById('viewer_full').dataset.id");
            document.getElementById('viewer_edit_option').setAttribute('onclick',"window.location.href = '/editor?id='+document.getElementById('viewer_full').dataset.id");
            
            if (data['unlisted'] == 1){
                document.querySelector('#viewer_unlist > img').src = '/static/ui_icons/unlisted.svg'
                document.getElementById('viewer_unlist_options_icon').src = '/static/ui_icons/unlisted.svg'
                document.getElementById('viewer_unlist_options_text').innerHTML = 'List'
                document.getElementById('viewer_desktop_unlist').innerHTML = 'List'
            }
        }


        //preload the images and put them into the preview pane
        document.getElementById('viewer_image_overview').innerHTML = ''
        images = []
        for (i=0;i<data['images'];i++){
            a = document.createElement('IMG')
            a.src = '/static/lineup_images/'+data['lineup_id']+'/'+(i+1)+'.webp'
            a.setAttribute('data-num',(i+1))
            a.setAttribute('onclick','go_to_image('+(i+1)+')')
            if (i == 0){
                a.setAttribute('class','selected')
            }
            document.getElementById('viewer_image_overview').appendChild(a)
            images.push('/static/lineup_images/'+data['lineup_id']+'/'+(i+1)+'.webp')
        }
        preloadImages(images);

        resize_viewer()

        document.getElementById('verified_desc').style.display = (data['verified'] ? 'inline' : 'none');
    }
    else if (data['error'] == 'signed out'){
        sign_out();
    }
    else{
        close_viewer()
    }
}

function load_setup_data(id){
    apply_viewer_settings()
    document.getElementById('viewer_image_overview_parent').style.display = 'none'
    document.getElementById('viewer_image_overview').innerHTML = ''
    document.querySelector('#viewer_upload_date').innerHTML = ''
    setup_images = []
    request_data = {
        'setup_id':id
    }
    if (localStorage.getItem('user_token') != null){
        request_data['user_token'] = localStorage.getItem('user_token');
    }
    else{
        saved_lineups = localStorage.getItem("saved")
        saved_type = localStorage.getItem("saved_type")
		if (saved_lineups != null){
			saved_lineups = saved_lineups.split(',');
            saved_type = saved_type.split(',');
			for (i=0;i<saved_lineups.length;i++){
				if (saved_lineups[i] == id && saved_type[i] == 'setup'){//if the lineup is saved
					document.getElementById('viewer_save').src = '/static/ui_icons/saved.svg';
				}
			}
		}
		if (saved_lineups == null){
			saved_lineups = [];
		}
    }

    document.getElementById('viewer_full').dataset.id = id;//store the setup id
    document.getElementById('viewer_full').dataset.type = 'setup';
    document.getElementById('viewer_background').style.display = 'flex';

    if (window.innerWidth <= 1100){
        document.getElementById('viewer_full').style.width = '80vw'
    }
    if (window.innerWidth <= 500){
        document.getElementById('viewer_full').style.width = '100vw';//set the loading animation to be 100%
        document.getElementById('viewer_title').style.display = 'flex';//show the back button
        document.getElementById('viewer_title_text').innerHTML = 'Back'//reset the title
    }
    resize_viewer()

    httpPostAsync('/get_setup',function(data){
        data = JSON.parse(data);
        if (data['state'] == 'done'){
            set_viewer_upload_date(data['date_uploaded'])
            //find the repeated abilities
            temp = {}
            for (i=0;i<data['abilities'].length;i++){
                if (temp[data['abilities'][i]['ability']] == undefined){
                    temp[data['abilities'][i]['ability']] = 0;
                }
                temp[data['abilities'][i]['ability']] += 1
            }

            temp2 = {}
            string = ''
            for (i=0;i<data['abilities'].length;i++){
                if (i == 0){
                    extra_class = 'selected'
                }
                else{
                    extra_class = ''
                }

                if (temp2[data['abilities'][i]['ability']] == undefined){
                    temp2[data['abilities'][i]['ability']] = 0;
                }
                temp2[data['abilities'][i]['ability']] += 1

                extra_text = ''
                if (temp[data['abilities'][i]['ability']] != 1){
                    extra_text = ' - '+temp2[data['abilities'][i]['ability']]
                }
                description = insert_description_links(data['abilities'][i]['description'])
                alt_desc_string = ''
                alternate_description = ''
                if (data['abilities'][i]['translated_description']){
                    description = insert_description_links(data['abilities'][i]['translated_description'])
                    alternate_description = insert_description_links(data['abilities'][i]['description'])
                    alt_desc_string = 'data-alternate_description = "'+alternate_description+'"'
                }
                string += "<div onclick='select_setup_ability(this.dataset.title)' class='setups_abilities "+extra_class+"' data-title='"+data['abilities'][i]['ability']+extra_text+"' data-description='"+description+"' "+alt_desc_string+">"+
                                "<img src='/static/abilities/"+data['abilities'][i]['ability']+".webp'>"+
                                "<span>"+data['abilities'][i]['ability'].replaceAll('_','/')+extra_text+"</span>"+
                            "</div>";
                
                setup_descriptions[data['abilities'][i]['ability']+extra_text] = description
                setup_alt_descriptions[data['abilities'][i]['ability']+extra_text] = alternate_description

                for (n=0;n<data['abilities'][i]['num_images'];n++){
                    if (data['abilities'][i]['lineup_id'] == null){
                        setup_images.push({
                            'title':data['abilities'][i]['ability']+extra_text,
                            'image_num':(i+1),
                            'name':(n+1),
                            'type':'setup'
                        })
                    }
                    else{
                        setup_images.push({
                            'title':data['abilities'][i]['ability']+extra_text,
                            'image_num':data['abilities'][i]['lineup_id'],
                            'name':(n+1),
                            'type':'lineup'
                        })
                    }
                }
            }
            setup_images.push({
                'type':'cover'
            })

            images = []
            document.getElementById('viewer_image_overview').innerHTML = ''
            for (i=0;i<setup_images.length;i++){
                if (setup_images[i]['type'] == 'lineup'){
                    images.push('/static/lineup_images/'+setup_images[i]['image_num']+'/'+setup_images[i]['name']+'.webp')
                }
                else if (setup_images[i]['type'] == 'setup'){
                    images.push('/static/setup_images/'+document.getElementById('viewer_full').dataset.id+'/images/'+setup_images[i]['image_num']+'/'+setup_images[i]['name']+'.webp')
                }
                else{
                    images.push('/static/setup_images/'+document.getElementById('viewer_full').dataset.id+'/cover.webp')
                }
                a = document.createElement('IMG')
                a.src = images[images.length-1]
                a.setAttribute('data-num',(i+1))
                a.setAttribute('onclick','go_to_image('+(i+1)+')')
                if (i == 0){
                    a.setAttribute('class','selected')
                }
                document.getElementById('viewer_image_overview').appendChild(a)
            }
            images.push('/static/setup_images/'+document.getElementById('viewer_full').dataset.id+'/cover.webp')
            preloadImages(images);
            
            if (data['translated_overview']){//if it has been translated
                overview = data['translated_overview']
                document.getElementById('viewer_full').dataset.alternate_overview = data['overview'];
                document.getElementById('viewer_full').dataset.alternate_title = data['title'];
                document.getElementById('viewer_title_text').innerHTML = data['translated_title'];
                document.getElementById('viewer_translation_wrapper').style.display = 'block'
                document.getElementById('viewer_translation_message').style.display = ''
                document.getElementById('viewer_translation_button').innerHTML = 'View original'
            }
            else{
                overview = data['overview'];
                document.getElementById('viewer_title_text').innerHTML = data['title'];
                document.getElementById('viewer_translation_wrapper').style.display = ''
            }
            
            document.getElementById('viewer_description_text').innerHTML = '<div id="setups_abilities_overview">'+overview+'</div>'+
                                                                            "<div id='setups_abilities_parent'>"+
                                                                                string+
                                                                            "</div>"+
                                                                            "<div id='setups_abilities_description'>"+
                                                                            insert_description_links((data['abilities'][0]['translated_description'] || data['abilities'][0]['description']))+
                                                                            "</div>";

            document.getElementById('viewer_description_abilities').style.display = 'none'
            document.querySelector('#viewer_owner_link > img').src = '/static/profile_pictures/'+data['profile_pic']
            document.getElementById('viewer_username_text').innerHTML = data['username']
            document.getElementById('viewer_owner_link').href = '/profile/'+data['username']
            if (data['unlisted'] == 1){
                document.getElementById('viewer_unlisted_alert').style.display = 'block'
            }

            if (data['saved'] != undefined){//if they are signed in
                if (data['saved'] == true){//if the lineup is saved
                    document.getElementById('viewer_save').src = '/static/ui_icons/saved.svg';
                }
                if (data['liked'] == true){//if the lineup is saved
                    document.getElementById('viewer_like').src = '/static/ui_icons/liked.svg';
                }
            }

            if (localStorage.getItem('username') == data['username']){//if the user owns the lineup NOTE:while this check is done client side a check is done again server side when the action is clicked
                document.getElementById('viewer_edit').style.display = '';
                document.getElementById('viewer_delete').style.display = '';
                document.getElementById('viewer_unlist').style.display = '';
                document.getElementById('viewer_edit_option').style.display = 'flex';
                document.getElementById('viewer_delete_option').style.display = 'flex';
                document.getElementById('viewer_list_option').style.display = 'flex';

                //make the edit buttons edit setup not lineup
                document.getElementById('viewer_edit').setAttribute('onclick',"window.location.href = '/setup-editor?id='+document.getElementById('viewer_full').dataset.id");
                document.getElementById('viewer_edit_option').setAttribute('onclick',"window.location.href = '/setup-editor?id='+document.getElementById('viewer_full').dataset.id");
                
                if (data['unlisted'] == 1){
                    document.querySelector('#viewer_unlist > img').src = '/static/ui_icons/unlisted.svg'
                    document.getElementById('viewer_unlist_options_icon').src = '/static/ui_icons/unlisted.svg'
                    document.getElementById('viewer_unlist_options_text').innerHTML = 'List'
                    document.getElementById('viewer_desktop_unlist').innerHTML = 'List'
                }
            }

            document.getElementById('verified_desc').style.display = (data['verified'] ? 'inline' : 'none');

            loadFunction = function(){
                document.getElementById('viewer_image_buttons').style.display = '';
                document.getElementById('viewer_image').style.display = 'block';
                document.getElementById('viewer_loading').style.display = 'none';
                //show the overview
                document.getElementById('viewer_image_overview_parent').style.display = ''
                resize_viewer()

                if (window.viewerImageLoad){
                    clearInterval(window.viewerImageLoad)
                }
            }
            document.getElementById('viewer_image').onload = loadFunction
            document.getElementById('viewer_image').onerror = () => {
                url = document.getElementById('viewer_image').src.split('?')
                url[1] = url[1] ? url[1]+'1' : 'refresh=1'
                document.getElementById('viewer_image').src = url[0] + '?' + url[1]
            }

            if (setup_images[0]['type'] == 'lineup'){
                document.getElementById('viewer_image').src = '/static/lineup_images/'+setup_images[0]['image_num']+'/'+setup_images[0]['name']+'.webp'
            }
            else{
                document.getElementById('viewer_image').src = '/static/setup_images/'+data['id']+'/images/'+setup_images[0]['image_num']+'/'+setup_images[0]['name']+'.webp'
            }
            window.viewerImageLoad = setInterval(loadFunction, 100)

            document.getElementById('viewer_max_image').innerHTML = setup_images.length;
            document.getElementById('viewer_current_image').innerHTML = '1';

            document.getElementById('viewer_description').style.display = 'flex';
            document.getElementById('viewer_title').style.display = 'flex';

            if (window.innerWidth <= 1100){
                document.getElementById('viewer_full').style.width = ''
                document.getElementById('viewer_full').style.height = ''
            }

            resize_viewer()
        }
        else{
            close_viewer()
        }
    },request_data)
}

function set_viewer_upload_date(date_str){
    document.querySelector('#viewer_upload_date').innerHTML = ''
    date_obj = (new Date(date_str*1000));
    date_str = date_obj.toLocaleDateString()
    time_delta = (((new Date())-date_obj)/1000)/60
    document.querySelector('#viewer_upload_date').innerHTML = 'on '+date_str
}

function previous_image(){//go to the previous image
    go_to_image(parseInt(document.getElementById('viewer_current_image').innerHTML)-1)
}

function next_image(){//go to the next image
    go_to_image(parseInt(document.getElementById('viewer_current_image').innerHTML)+1)
}


function go_to_image(pos){
    window.event.stopPropagation()
    if (pos <= document.getElementById('viewer_max_image').innerHTML && pos >= 1){
        document.querySelector('#viewer_image_overview > img[data-num="'+pos+'"]').scrollIntoView({'inline':'center','block':'center'})
        document.querySelectorAll('#viewer_image_overview > img.selected').forEach(box => {
            box.classList.remove('selected')
        })
        document.querySelector('#viewer_image_overview > img[data-num="'+pos+'"]').classList.add('selected')
        document.getElementById('viewer_current_image').innerHTML = pos//parseInt(document.getElementById('viewer_current_image').innerHTML) + 1;
        if (document.getElementById('viewer_current_image').innerHTML != document.getElementById('viewer_max_image').innerHTML){
            document.getElementById('viewer_image_next').style.display = 'block';
        }
        else{
            document.getElementById('viewer_image_next').style.display = 'none';
        }
        if (document.getElementById('viewer_current_image').innerHTML == 1){
            document.getElementById('viewer_image_back').style.display = 'none';
        }
        else{
            document.getElementById('viewer_image_back').style.display = 'block';
        }

        //on a timeout to reduce the 'jumpiness' of switching between images
        timeout = setTimeout(function(){
            document.getElementById('viewer_image_buttons').style.display = 'none';
            document.getElementById('viewer_image').style.display = 'none';
            document.getElementById('viewer_loading').style.display = 'block';
        },100)
        document.getElementById('viewer_image').onload = function(){
            document.getElementById('viewer_image_buttons').style.display = '';
            document.getElementById('viewer_image').style.display = 'block';
            document.getElementById('viewer_loading').style.display = 'none';
            clearTimeout(timeout)
            resize_viewer()
        } 

        selected_image = parseInt(document.getElementById('viewer_current_image').innerHTML)
        //if its a setup
        if (document.getElementById('viewer_full').dataset.type == 'setup'){
            if (setup_images[selected_image-1]['type'] == 'lineup'){
                document.getElementById('viewer_image').src = '/static/lineup_images/'+setup_images[selected_image-1]['image_num']+'/'+setup_images[selected_image-1]['name']+'.webp'
            }
            else if(setup_images[selected_image-1]['type'] == 'setup'){
                document.getElementById('viewer_image').src = '/static/setup_images/'+document.getElementById('viewer_full').dataset.id+'/images/'+setup_images[selected_image-1]['image_num']+'/'+setup_images[selected_image-1]['name']+'.webp'
            }
            else{//if its a cover image
                document.getElementById('viewer_image').src = '/static/setup_images/'+document.getElementById('viewer_full').dataset.id+'/cover.webp'
            }
            select_setup_ability()
        }
        else if(document.getElementById('viewer_full').dataset.type == 'lineup'){
            document.getElementById('viewer_image').src = '/static/lineup_images/'+document.getElementById('viewer_full').dataset.id+'/'+document.getElementById('viewer_current_image').innerHTML+'.webp'
        }

        if (document.getElementById('viewer_current_image').innerHTML == document.getElementById('viewer_max_image').innerHTML){
            document.getElementById('viewer_image_next').style.display = 'none';//hide the button if we are at the end
        }
    }
}

function change_image_overview_pin(){
    data = JSON.parse(localStorage.getItem('viewer_data'))
    if (!document.getElementById('viewer_image_overview_parent').classList.contains('pinned')){
        data['pin_overview'] = true;
    }
    else{
        data['pin_overview'] = false;
    }
    localStorage.setItem('viewer_data',JSON.stringify(data))
    apply_viewer_settings()
    resize_viewer()
}

function change_image_overview_collapse(){
    data = JSON.parse(localStorage.getItem('viewer_data'))
    if (!document.getElementById('viewer_image_overview_parent').classList.contains('open')){
        data['collapse_overview'] = false;
    }
    else{
        data['collapse_overview'] = true;
        data['pin_overview'] = false;
    }
    localStorage.setItem('viewer_data',JSON.stringify(data))
    apply_viewer_settings()
    resize_viewer()
}

function apply_viewer_settings(){
    data = JSON.parse(localStorage.getItem('viewer_data'))
    if (data['pin_overview']){
        document.getElementById('viewer_image_overview_parent').classList.add('pinned')
        document.getElementById('viewer_image_overview_pin').src = '/static/ui_icons/pinned.svg'
        document.getElementById('viewer_image_overview_pin').title = 'Unpin image overview'
    }
    else{
        document.getElementById('viewer_image_overview_parent').classList.remove('pinned')
        document.getElementById('viewer_image_overview_pin').src = '/static/ui_icons/pin.svg'
        document.getElementById('viewer_image_overview_pin').title = 'Pin image overview'
    }

    if (!data['collapse_overview']){
        document.getElementById('viewer_overview_desktop').innerHTML = 'Hide overview'
        document.getElementById('viewer_overview_text').innerHTML = 'Hide overview'
        document.getElementById('viewer_image_overview_parent').classList.add('open')
        document.getElementById('viewer_image_overview_expand').src = '/static/ui_icons/expand.svg'
        document.getElementById('viewer_image_overview_expand').title = 'Collapse image overview'
    }
    else{
        document.getElementById('viewer_overview_desktop').innerHTML = 'Show overview'
        document.getElementById('viewer_overview_text').innerHTML = 'Show overview'
        document.getElementById('viewer_image_overview_parent').classList.remove('open')
        document.getElementById('viewer_image_overview_parent').classList.remove('pinned')
        document.getElementById('viewer_image_overview_expand').src = '/static/ui_icons/collapse.svg'
        document.getElementById('viewer_image_overview_pin').src = '/static/ui_icons/pin.svg'
        document.getElementById('viewer_image_overview_expand').title = 'Expand image overview'
    }

    if (data['description_alignment'] == 'left'){
        document.getElementById('viewer_full').classList.add('left_align')
    }
    else{
        document.getElementById('viewer_full').classList.remove('left_align')
    }
}

function select_setup_ability(switch_title=null){
    if (switch_title != null){
        current = 0;
        found = false;
        while (found==false){
            if (setup_images[current]['title'] == switch_title){
                found = true;
            }
            else{
                current += 1
            }
        }

        //lazy ik
        document.getElementById('viewer_current_image').innerHTML = current
        next_image()
    }
    else{
        current = parseInt(document.getElementById('viewer_current_image').innerHTML)-1
    }

    els = document.getElementsByClassName('setups_abilities')
    for (i=0;i<els.length;i++){
        els[i].style.width = ''
        els[i].classList.remove('selected')
    }

    if (setup_images[current]['title'] != undefined){
        el = document.querySelector('.setups_abilities[data-title="'+setup_images[current]['title']+'"]')
        temp = setup_descriptions[setup_images[current]['title']];
        document.querySelector('#setups_abilities_description').innerHTML = temp
        el.classList.add('selected')
    }
    else{
        document.querySelector('#setups_abilities_description').innerText = 'Final image'
    }
}



function share_lineup(id=document.getElementById('viewer_full').dataset.id,type=document.getElementById('viewer_full').dataset.type){//share the lineup
    //first lets automatically copy the lineup link to the clipboard
    url = 'https://lineupsvalorant.com/?id='+id
    if (type == 'setup'){
        url = 'https://lineupsvalorant.com/?setup='+id
    }
    
    if (navigator.share != undefined && window.innerWidth < 800){//if navigator.share is probs supported or they arent in the BIG MODE
        try{//ensure we handle any unsupported stuff 
            //next open the share window 
            navigator.share({
                url: url
            })
        }
        catch{
            navigator.clipboard.writeText(url)
            create_bottom_alert('Link Copied')
        }
    }
    else{//if the share option is unsupported then just tell the user we copied it to the clipboard
        navigator.clipboard.writeText(url)
        create_bottom_alert('Link Copied')
    }
    if (localStorage.getItem('user_token') != undefined){//if they are signed in
        httpPostAsync('/profile',function(data){
            data = JSON.parse(data)
            if (data['unlocked_pfp'] != undefined){//if they unlocked pfp update notification
                update_notifications()
            }
        },{'user_token':localStorage.getItem('user_token'),'request_type':'share_lineup'})
    }

    if (!window.matchMedia('(max-width: 800px)').matches){
        document.getElementById('viewer_share').src = '/static/ui_icons/done.svg'
        document.getElementById('viewer_share').classList.add('viewer_like_animation')
        setTimeout(function(){
            document.getElementById('viewer_share').classList.remove('viewer_like_animation')
        },400)
        setTimeout(function(){
            document.getElementById('viewer_share').src = '/static/ui_icons/copy.svg'
        },2000)
    }

    document.getElementById('viewer_full').dataset.click_interval = 0//stop this counting towards a double click for like
}

function save_lineup(id=document.getElementById('viewer_full').dataset.id,type=document.getElementById('viewer_full').dataset.type){
    document.getElementById('viewer_full').dataset.click_interval = 0//stop this counting towards a double click for like
    saved = false;
    //check if the user is logged in
    if (localStorage.getItem('user_token') == null){//if they arent signed in
        saved_lineups = []
        saved_type = []
        deleted = false;
        try{
            saved_lineups = localStorage.getItem('saved').split(',');
            if (localStorage.getItem('saved_type') == null){
                for (i=0;i<saved_lineups.length;i++){
                    saved_type.push('lineup')
                }
            }
            else{
                saved_type = localStorage.getItem('saved_type').split(',');
            }            
        }
        catch{}
		for (i=0;i<saved_lineups.length;i++){
			if (saved_lineups[i] == id && saved_type[i] == type){//if it is already saved
				saved_lineups.splice(i,1);
				deleted = true;
				tool_text = 'Lineup Unsaved';
				document.getElementById('viewer_save').src = '/static/ui_icons/save.svg';
			}
		}
		if (deleted == false){
			saved_lineups.push(id)
            saved_type.push(type)
			tool_text = 'Lineup Saved'
			document.getElementById('viewer_save').src = '/static/ui_icons/saved.svg';	
            saved = true;
		}
		
		temp = ''
        temp2 = ''
		for (i=0;i<saved_lineups.length;i++){
			temp += saved_lineups[i]
            temp2 += saved_type[i]
			if (i < saved_lineups.length-1){
				temp += ','
                temp2 += ','
			}
		}
		if (temp == ''){
			localStorage.removeItem("saved");
		}
		else{
			localStorage.setItem("saved", temp);
            localStorage.setItem("saved_type", temp2);
		}
		
		saved_lineups = localStorage.getItem("saved");
		if (saved_lineups != null){
			saved_lineups = saved_lineups.split(',');
		}
		if (saved_lineups == null){
			saved_lineups = [];
		}
		create_bottom_alert(tool_text)
	}
	else{
		httpPostAsync('/saved',function(data){
			data = JSON.parse(data);
			if (data['state'] == 'done'){
                string = type
                if (data['unlocked_pfp'] != undefined){//if the user unlocked a pfp
                    update_notifications()
                }
				if (data['action'] == 'saved'){//if we saved the lineup
					tool_text = 'Lineup Saved'
                    save = true;
					document.getElementById('viewer_save').src = '/static/ui_icons/saved.svg';
                    saved = true
				}
				else{//if we unsaved the lineup
					tool_text = 'Lineup Unsaved'
					document.getElementById('viewer_save').src = '/static/ui_icons/save.svg';
				}
				create_bottom_alert(tool_text)
			}
			else{
				create_bottom_alert('Failed to save lineup')
			}
		},{'user_token':localStorage.getItem('user_token'),
        'id':id,
        'request-type':'save',
        'type':type})

        image = document.getElementById('viewer_save').src.split('/')
        image = image[image.length-1]
        if (image == 'save.svg'){
            document.getElementById('viewer_save').src = '/static/ui_icons/saved.svg';
        }
        else{
            document.getElementById('viewer_save').src = '/static/ui_icons/save.svg';
        }
	}
    close_viewer_options()
    return saved
}

function delete_lineup(deletelineup){
    document.getElementById('viewer_full').dataset.click_interval = 0//stop this counting towards a double click for like
	if (deletelineup == true){
        if (document.getElementById('viewer_full').dataset.type == 'setup'){
            request_type = 'delete-setup'
        }
        else{
            request_type = 'delete'
        }
		httpPostAsync('/lineup_edit',function(data){
			data = JSON.parse(data)
			if (data['state'] == 'done'){
                sessionStorage.removeItem('profile_stats');//delete the profile stats cache because its now out of date
				window.history.go(0);//refresh the page if we succeeded 
			}
			else{
                create_popup('Error deleting lineup',
                'Sorry but there was an error deleting your lineup, please ensure you are signed in properly',
                        [{'text':'Close','function':function(){
                            document.getElementById('failed_delete_popup').parentNode.removeChild(document.getElementById('failed_delete_popup'))
                                                    },
                        'filled':true}],id='failed_delete_popup')
			}
		},{'request_type':request_type,'id':document.getElementById('viewer_full').dataset.id,'user_token':localStorage.getItem('user_token')})
	}
	document.getElementById('delete_lineup_confirmation').classList.add('hidden');
}

function unlist_lineup(){
    document.getElementById('viewer_full').dataset.click_interval = 0//stop this counting towards a double click for like
    close_viewer_options()
    httpPostAsync('/lineup_edit',function(data){
        data = JSON.parse(data)
        if (data['state'] == 'done'){
            if (data['action'] == 'listed'){
                document.getElementById('viewer_unlist_options_icon').src = '/static/ui_icons/listed.svg'
                document.getElementById('viewer_unlist_options_text').innerHTML = 'Unlist'
                document.getElementById('viewer_desktop_unlist').innerHTML = 'Unlist'
                
                document.querySelector('#viewer_unlist > img').src = '/static/ui_icons/listed.svg'
                document.getElementById('viewer_unlisted_alert').style.display = ''
                create_bottom_alert('Lineup added back to search results')
            }
            else{
                document.getElementById('viewer_unlist_options_icon').src = '/static/ui_icons/unlisted.svg'
                document.getElementById('viewer_unlist_options_text').innerHTML = 'List'
                document.getElementById('viewer_desktop_unlist').innerHTML = 'List'

                document.querySelector('#viewer_unlist > img').src = '/static/ui_icons/unlisted.svg'
                document.getElementById('viewer_unlisted_alert').style.display = 'block'
                create_bottom_alert('Lineup removed from search results')
            }
        }
        else if (data['state'] == 'force unlisted'){
            string = document.getElementById('viewer_full').dataset.type
            create_bottom_alert('Lineup is force unlisted')
        }
        else{
            create_bottom_alert('Failed to edit listing')
        }
    },{'request_type':'toggle_unlisted',
    'user_token':localStorage.getItem('user_token'),
    'id':document.getElementById('viewer_full').dataset.id,
    'type':document.getElementById('viewer_full').dataset.type})
}

function report_lineup(report){
    document.getElementById('viewer_full').dataset.click_interval = 0//stop this counting towards a double click for like
    document.getElementById('report_lineup_confirmation').classList.add('hidden')
    if (report == true){
        if (document.querySelector('.report_option:checked') == undefined){
            create_bottom_alert('Please select a reason')
            // document.getElementById('report_lineup_confirmation').style.display = 'flex'
            document.getElementById('report_lineup_confirmation').classList.remove('hidden')
        }
        else{
            reasons = document.querySelectorAll('.report_option:checked')//get the reasons
            reason = ''
            for (i=0;i<reasons.length;i++){
                reason += reasons[i].parentNode.querySelector('label').innerHTML+', '
            }
            httpPostAsync('/lineup_edit',function(data){
                data = JSON.parse(data)
                if (data['state'] == 'done'){
                    create_bottom_alert('Report sent successfully')
                }
                else{
                    create_bottom_alert('Failed to send report')
                }
            },{'lineup_id':document.getElementById('viewer_full').dataset.id,
                'reason':reason,
                'type':document.getElementById('viewer_full').dataset.type, 
                'comment':document.getElementById('viewer_report_comment').value,
                'request_type':'report'})
        }
    }

    document.getElementById('viewer_report_comment').value = ''
}

function like_lineup(id,type,show_animation=false){
    document.getElementById('viewer_full').dataset.click_interval = 0//stop this counting towards a double click for like
    if (localStorage.getItem('user_token') != null){
        httpPostAsync('/saved',function(data){
            data = JSON.parse(data)
            if (data['state'] == 'done'){
                if (data['like_state'] == true){
                    document.getElementById('viewer_like').src = '/static/ui_icons/liked.svg'
                }
                else{
                    document.getElementById('viewer_like').src = '/static/ui_icons/like.svg'
                }
            }
            else{
                create_bottom_alert('Failed to like/unlike')
            }
        },{'user_token':localStorage.getItem('user_token'),'request-type':'toggle-liked','id':id,'type':type})

        //update the ui immediately 
        image = document.getElementById('viewer_like').src.split('/')
        if (image[image.length-1] == 'liked.svg'){
            document.getElementById('viewer_like').src = '/static/ui_icons/like.svg'
            document.getElementById('viewer_like').classList.add('viewer_like_animation')
            if (document.getElementById('viewer_like_count').dataset.value != '') {
                document.getElementById('viewer_like_count').dataset.value = parseInt(document.getElementById('viewer_like_count').dataset.value) - 1
            }
        }
        else{
            document.getElementById('viewer_like').src = '/static/ui_icons/liked.svg'
            document.getElementById('viewer_like').classList.add('viewer_like_animation')
            if (document.getElementById('viewer_like_count').dataset.value != '') {
                document.getElementById('viewer_like_count').dataset.value = parseInt(document.getElementById('viewer_like_count').dataset.value) + 1
            }
        }
        setTimeout(function(){
            document.getElementById('viewer_like').classList.remove('viewer_like_animation')
        },300)


        if (show_animation){
            document.getElementById('viewer_like_animation').style.display = 'inline'
            setTimeout(function(){
                document.getElementById('viewer_like_animation').style.display = ''
            },600)
        }
    }
}

function show_viewer_more_options(){
    document.getElementById('viewer_full').dataset.click_interval = 0//stop this counting towards a double click for like
    if (window.matchMedia('(max-width:500px)').matches){
        document.getElementById('viewer_options_bg').style.display = 'block';
        document.getElementById('viewer_options').style.transition = 'bottom 0.1s, opacity 0.2s';
        setTimeout(function(){
            document.getElementById('viewer_options').style.bottom = '0vh';
            document.getElementById('viewer_options').style.opacity = '1';
        },50)
    }
    else{
        document.getElementById('viewer_more_options_popup_desktop').style.display = 'block';
        window.event.stopPropagation();
    }
}

function close_viewer_options(){
    document.getElementById('viewer_full').dataset.click_interval = 0//stop this counting towards a double click for like
    document.getElementById('viewer_options_bg').style.display = 'none';
    document.getElementById('viewer_options').style.transition = '';
    document.getElementById('viewer_options').style.bottom = '';
    document.getElementById('viewer_options').style.opacity = '';
}

function close_viewer(){
    //close the viewer and reset all the properties
    window.history.replaceState({ additionalInformation: 'Directed to lineup' }, 'LineupsValorant', '?');//remove the lineup id from the url

    document.getElementById('viewer_background').classList.add('viewer_closing');
    el = document.querySelector('.lineup-box[data-id="'+document.getElementById('viewer_full').dataset.id+'"]')
    if (el){
        el = el.getBoundingClientRect()
        x = (el.left + el.width/2)-window.innerWidth/2
        y = (el.top + el.height/2)-window.innerHeight/2
    }
    else{
        x = 0
        y = 0
    }    

    document.getElementById('viewer_full').style.setProperty('--xpos1',(x)+'px');
    document.getElementById('viewer_full').style.setProperty('--ypos', (y)+'px');

    document.getElementById('viewer_full').style.transformOrigin = ''
    setTimeout(function(){
        document.getElementById('viewer_background').classList.remove('viewer_closing');
        document.getElementById('viewer_background').style.display = 'none';
        document.getElementById('viewer_image_buttons').style.display = 'none';
        document.getElementById('viewer_image').style.display = 'none';
        document.getElementById('viewer_description').style.display = '';
        document.getElementById('viewer_title').style.display = '';
        document.getElementById('viewer_loading').style.display = 'block';
        document.getElementById('viewer_save').src = '/static/ui_icons/save.svg';
        if (document.getElementById('viewer_like')){
            document.getElementById('viewer_like').src = '/static/ui_icons/like.svg';
        }
        document.getElementById('viewer_edit').style.display = 'none';
        document.getElementById('viewer_delete').style.display = 'none';
        document.getElementById('viewer_unlist').style.display = 'none';
        document.getElementById('viewer_edit_option').style.display = 'none';
        document.getElementById('viewer_delete_option').style.display = 'none';
        document.getElementById('viewer_list_option').style.display = 'none';
        document.getElementById('viewer_image_back').style.display = 'none';
        document.getElementById('viewer_image_next').style.display = 'inline';
        document.getElementById('viewer_more_options_popup_desktop').style.display = ''

        document.getElementById('viewer_unlist_options_icon').src = '/static/ui_icons/listed.svg'
        document.getElementById('viewer_unlist_options_text').innerHTML = 'Unlist'
        document.getElementById('viewer_desktop_unlist').innerHTML = 'Unlist'
        
        document.querySelector('#viewer_unlist > img').src = '/static/ui_icons/listed.svg'
        document.getElementById('viewer_unlisted_alert').style.display = ''
    },310)
}

function resize_viewer(){
    if (window.innerWidth > 1100){
        preview_height = 0
        if (document.querySelector('#viewer_image_overview_parent.pinned')){
            preview_height = document.querySelector('#viewer_image_overview_parent.pinned').clientHeight
        }
        ratio = (document.getElementById('viewer_image').naturalHeight+preview_height)/document.getElementById('viewer_image').naturalWidth;
        
        w = window.innerWidth*0.9-400
        h = window.innerHeight*0.9//+preview_height
        if (w*ratio < h){
            final_h = w*ratio
        }
        else{
            final_h = h
        }
        document.getElementById('viewer_full').style.height = final_h+'px';
        document.getElementById('viewer_share').src = '/static/ui_icons/copy.svg'
    }
    else if (window.innerWidth > 500){
        document.getElementById('viewer_full').style.height = '';
        if (document.getElementById('viewer_full').clientHeight > window.innerHeight){//if the box overflows then add padding to the top and bottom
            document.getElementById('viewer_container').style.padding = '5em 0'
        }
        else{
            document.getElementById('viewer_container').style.padding = '0'
        }
        document.getElementById('viewer_share').src = '/static/ui_icons/share.svg'
    }
    else{
        document.getElementById('viewer_full').style.height = '';
        document.getElementById('viewer_container').style.padding = '0';
        document.getElementById('viewer_share').src = '/static/ui_icons/share.svg'
    }
}

function open_lineup(id){
    if (window.location.pathname == '/'){
	    window.history.pushState({ additionalInformation: 'Directed to lineup' }, 'LineupsValorant', '?id='+id);
    }
	load_lineup_data(id);
}

function open_setup(id){
    if (window.location.pathname == '/'){
	    window.history.pushState({ additionalInformation: 'Directed to setup' }, 'LineupsValorant', '?setup='+id);
    }
	load_setup_data(id);
}

function swap_translation(){
    if (document.getElementById('viewer_full').dataset.type == 'lineup'){
        temp_description = document.getElementById('viewer_description_text').innerHTML
        temp_title = document.getElementById('viewer_title_text').innerHTML
        document.getElementById('viewer_description_text').innerHTML = document.getElementById('viewer_full').dataset.alternate_description;
        document.getElementById('viewer_title_text').innerHTML = document.getElementById('viewer_full').dataset.alternate_title;
        document.getElementById('viewer_full').dataset.alternate_description = temp_description
        document.getElementById('viewer_full').dataset.alternate_title = temp_title;
    }
    else{
        temp_overview = document.getElementById('setups_abilities_overview').innerHTML
        temp_title = document.getElementById('viewer_title_text').innerHTML
        document.getElementById('setups_abilities_overview').innerHTML = document.getElementById('viewer_full').dataset.alternate_overview
        document.getElementById('viewer_full').dataset.alternate_overview = temp_overview;

        document.getElementById('viewer_title_text').innerHTML = document.getElementById('viewer_full').dataset.alternate_title;
        document.getElementById('viewer_full').dataset.alternate_title = temp_title;

        els = document.getElementsByClassName('setups_abilities')
        for (i=0;i<els.length;i++){
            title = els[i].dataset.title
            temp = setup_descriptions[title]
            setup_descriptions[title] = setup_alt_descriptions[title]
            setup_alt_descriptions[title] = temp
        }

        if (document.querySelector('.setups_abilities.selected')){
            document.getElementById('setups_abilities_description').innerHTML = setup_descriptions[document.querySelector('.setups_abilities.selected').dataset.title]
        }
    }

    if (document.getElementById('viewer_translation_message').style.display == ''){//if the lineup is currently translated
        document.getElementById('viewer_translation_message').style.display = 'none'
        document.getElementById('viewer_translation_button').innerHTML = 'Translate lineup'
    }
    else{
        document.getElementById('viewer_translation_message').style.display = ''
        document.getElementById('viewer_translation_button').innerHTML = 'View original'
    }
}

document.addEventListener('keydown',function(e){
    if (document.getElementById('viewer_background').style.display == 'flex' && document.getElementById('report_lineup_confirmation').classList.contains('hidden')){
        e = e || window.event;
        key = e.key
        if (key == 'ArrowLeft' || key == 'a'){
            previous_image()
        }
        if (key == 'ArrowRight' || key == 'd'){
            next_image()
        }
        if (key == 'Escape'){
            close_viewer()
        }
        if (key == 'L' || key == 'l'){
            like_lineup(document.getElementById('viewer_full').dataset.id,document.getElementById('viewer_full').dataset.type)
        }
    }
});

document.getElementById('viewer_full').addEventListener('click',function(e){
    e.stopPropagation();
    document.getElementById('viewer_more_options_popup_desktop').style.display = ''
})

window.addEventListener('resize', resize_viewer);

//preload the ui icons for responsiveness
preloadImages([
    '/static/ui_icons/liked.svg',
    '/static/ui_icons/done.svg',
    '/static/ui_icons/saved.svg'
])
