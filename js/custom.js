document.addEventListener('DOMContentLoaded', function() {
    // Add a class to the body when the page is loaded
    document.body.classList.add('loaded');
    create_bibliography();
    
    // Initialize the modal for the BibTeX
    var modal_elems = document.querySelectorAll('.modal');
    var modal_instances = M.Modal.init(modal_elems, {});

    var scroll_elems = document.querySelectorAll('.scrollspy');
    var scroll_instances = M.ScrollSpy.init(scroll_elems, {});


    $("#bibtex-copy").click(function() {
        navigator.clipboard.writeText($("#bibtex-modal-content").text());
      }
    );
});


function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
      result = xmlhttp.responseText;
    }
    return result;
  }


function create_bibliography() {

    
    data=loadFile("includes/bibliography.bib");
    bib_data=parseBibTeX(data);
        // console.log(bib_data);
    //Loop through all the entries in the parsed BibTeX data and create a list item for each entry in the ul element with id "publications"
    const publicationsList = document.getElementById('publications-list');
    const phdItem = document.getElementById('phd-thesis');
    var curr_year=0;
    for (const entry of bib_data) {
        if (entry.entryType=="phdthesis") {
            const listHead = document.createElement('li');
            listHead.classList.add('collection-header');
            phd=document.createElement('h3');
            phd.textContent = "PhD Thesis";
            listHead.appendChild(phd);
            phdItem.appendChild(listHead);
        }else{
            if (entry.fields.year!=curr_year){
                curr_year=entry.fields.year;
                const listHead = document.createElement('li');
                listHead.classList.add('collection-header');
                year=document.createElement('h2');
                year.textContent = entry.fields.year;
                listHead.appendChild(year);

                publicationsList.appendChild(listHead);
            }
        }
        
        const listItem = document.createElement('li');
        listItem.classList.add('collection-item');
        
        //get the publication title
        const pub_title = document.createElement('a');
        pub_title.href = '#publication-modal';
        pub_title.classList.add('title','modal-trigger');
        pub_title.textContent = entry.fields.title + '. ';
        listItem.appendChild(pub_title);
        
        //get the publication author
        var authors=[]
        if(entry.entryType!="phdthesis"){
            authors = entry.fields.author.split(' and ');
        }
        pub_author = document.createElement('span');
        pub_author_elems=[];
        cnt=0;  
        for (const author of authors) {
            author_name=author.split(',')[1] + ' ' + author.split(',')[0];

            if (author_name.includes("Hitarth")){
                author_name="<b>"+author_name+"</b>";
            }

            if (pub_author.innerHTML == ''){
                pub_author.innerHTML = author_name;
            }else if (cnt>=authors.length-1){
                pub_author.innerHTML = pub_author.innerHTML + ' & ' + author_name;
            }else{
                pub_author.innerHTML = pub_author.innerHTML + ', ' + author_name;
            }
            cnt++;
        }

        if(pub_author.innerHTML !=''){
            pub_author.innerHTML = pub_author.innerHTML + '. ';
            listItem.appendChild(document.createElement('br')); 
            listItem.appendChild(pub_author);
        }
        
        //get the publication journal/booktitle
        const pub_venue = document.createElement('div');
        pub_venue.classList.add('venue');
        if (entry.fields.journal){
            pub_venue.textContent = entry.fields.journal;
            if (entry.fields.volume){
                pub_venue.textContent = pub_venue.textContent + ', ' + entry.fields.volume;
            }
            if (entry.fields.number){
                pub_venue.textContent = pub_venue.textContent + '(' + entry.fields.number + ')';
            }
        }else if (entry.fields.booktitle){
            pub_venue.textContent = "In " + entry.fields.booktitle;
        }

        if (entry.fields.series){
            pub_venue.textContent = pub_venue.textContent + ' (' + entry.fields.series + ')';
        }

        if (pub_venue.textContent != '') {
            pub_venue.textContent = pub_venue.textContent + '.';
            listItem.appendChild(pub_venue);
        }
        const pub_year_school = document.createElement('div');
        pub_year_school.style.marginBottom = '5px';
        if (entry.entryType=="phdthesis"){
            //get publication year and school
            pub_year_school.textContent = entry.fields.school + ". " + entry.fields.year + '.';
            listItem.appendChild(pub_year_school);
        }

        //check if note field exists
        const note = document.createElement('div');
        if (entry.fields.note && entry.entryType!="phdthesis"){
            note.classList.add('chip');
            note.textContent = entry.fields.note;
            listItem.appendChild(note);

            const note_break = document.createElement('br');
            note_break.classList.add('hide-on-med-and-up');
            listItem.appendChild(note_break);
        }

        //check if URL field exists
        const url = document.createElement('a');
        if (entry.fields.url){
            url.href = entry.fields.url;
            url.target = '_blank';
            url.classList.add('btn','chip', 'waves-effect', 'blue', 'white-text');
            url.textContent = 'PDF';
            pdf_icon = document.createElement('img');
            pdf_icon.classList.add('left','icon');
            pdf_icon.src = 'img/acrobat.svg';
            url.appendChild(pdf_icon);
            listItem.appendChild(url);
        }
        
        //get doi
        const doi = document.createElement('a');
        if (entry.fields.doi){
            doi.href = 'https://doi.org/' + entry.fields.doi;
            doi.target = '_blank';
            doi.classList.add('btn','chip', 'waves-effect', 'blue', 'white-text');
            doi.textContent = 'Web';
            web_icon = document.createElement('i');
            web_icon.classList.add('material-icons', 'left');
            web_icon.textContent = 'public';
            doi.appendChild(web_icon);
            listItem.appendChild(doi);
        }

        //get bibtex -- trigger modal
        const bibtex = document.createElement('a');
        bibtex.href = '#bibtex-modal';
        bibtex.classList.add('btn','chip', 'waves-effect', 'blue', 'white-text', 'modal-trigger');
        bib_icon = document.createElement('i');
        bib_icon.classList.add('material-icons', 'left');
        bib_icon.textContent = 'import_contacts';
        bibtex.textContent = 'BibTeX';
        bibtex.appendChild(bib_icon);


        bibtex.onclick = function() {
            document.getElementById('bibtex-modal-content').innerHTML = '<pre>'+bibtexStrings[entry.citationKey]+'</pre>';
        };
        listItem.appendChild(bibtex);

        pub_title.onclick = function() {
            modal_html='<h3>'+entry.fields.title+'</h3>';
            modal_html+='<div class="chip">'+entry.fields.note+'</div>';
            if (entry.fields.url){
                modal_html+=url.outerHTML;
            }
            modal_html+=doi.outerHTML;
            if (entry.entryType=="phdthesis") {
                modal_html+='<p class="bold">'+pub_year_school.textContent+'</p>';
            }else{
                modal_html+='<p><span class="bold blue-text text-darken-4">Authors:</span> '+pub_author.innerHTML+'</p>';
                modal_html+='<p><span class="bold blue-text text-darken-4">Appeared in:</span> '+pub_venue.textContent.replace("In ","")+'</p>';
            }
            if (entry.fields.abstract){
                modal_html+='<p><span class="bold blue-text text-darken-4">Abstract:</span><br><span class="abstract z-depth-1">'+entry.fields.abstract+'</span></p>';
            }
            modal_html+='<br><div><span class="bold blue-text text-darken-4">BibTeX:</span><br><pre>'+bibtexStrings[entry.citationKey]+'</pre></div>';
            document.getElementById('publication-modal-content').innerHTML = modal_html;
        };
        
        if (entry.entryType=="phdthesis") {
            phdItem.appendChild(listItem);
        }else{
            publicationsList.appendChild(listItem);
        }


    }
}

function removeEscapeCharacters(str) {
    return str.replace(/\\(\w)/g, '$1')
    .replace(/\\[{}]/g, '')   // Remove backslashes before braces
    .replace(/[{}]/g, '')     // Remove remaining braces
    .replace(/\\/g, '');      // Remove any other backslashes

}

const bibtexStrings = [];
function parseBibTeX(bibtexString) {
    const entries = [];
    const entryPattern = /@(\w+)\s*{\s*([^,]+),([\s\S]+?)^}/gm;
    let match;

    while ((match = entryPattern.exec(bibtexString)) !== null) {
        const entryType = match[1];
        const citationKey = match[2];
        const fieldsString = match[3];

        const fields = {};
        const fieldPattern = /\s*(\w+)\s*=\s*({([^{}]*|{[^{}]*})*}|"[^"]*")\s*,?/gm;
        let fieldMatch;

        while ((fieldMatch = fieldPattern.exec(fieldsString)) !== null) {
            const fieldName = fieldMatch[1].toLowerCase();
            let fieldValue = fieldMatch[2];
            // Remove braces or quotes around field values
            if (fieldValue.startsWith('{') || fieldValue.startsWith('"')) {
                fieldValue = fieldValue.slice(1, -1);
            }
            fields[fieldName] = removeEscapeCharacters(fieldValue);
        }

        entries.push({
            entryType: entryType,
            citationKey: citationKey,
            fields: fields,
        });

        bib_string=fieldsString.replace(/( )*(note|series|abstract)\s*=\s*({([^{}]*|{[^{}]*})*}|"[^"]*")\s*,?/gm,"")
        bib_string=bib_string.replace(/([\r\n][\r\n])+/gm,'\n')

        bibtexStrings[citationKey]="@"+entryType+"{"+citationKey+","+bib_string+"}";
    }

    //Sort the entries by year (fields.year) in descending order
    entries.sort((a, b) => {
        if (a.fields.year > b.fields.year) {
            return -1;
        }
        if (a.fields.year < b.fields.year) {
            return 1;
        }
        return 0;
    });

    return entries;
}