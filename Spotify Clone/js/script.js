let card = document.querySelectorAll(".card")
let audio = new Audio()
let titlediv = document.querySelector(".playname")
let playbar = document.querySelector("#play")
let songol
let currentElement = null;
let currentsong
let volume
let song
let folder
document.querySelector(".circle").hidden = true
function convertTime(seconds) {
    if (!seconds) {
        return  "00:00"
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Format the minutes and seconds to always be two digits
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

    return `${formattedMinutes}:${formattedSeconds}`;
}

// This is used to bring the play button on cards when hovered

//adds The play button on hover
for (let index = 0; index < card.length; index++) {
    const element = card[index];
    element.addEventListener("mouseover", () => {
        document.querySelectorAll(".play")[index].classList.add("view")
    })

}
//removes The play button on hover off
for (let index = 0; index < card.length; index++) {
    const element = card[index];
    element.addEventListener("mouseout", () => {
        document.querySelectorAll(".play")[index].classList.remove("view")
    })

}

// Used to get the song href to play them with play()
async function getsongs(folder) {
    let a = await fetch(`/songs/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    //gets all element that has the name <a> from response and add it to array of as
    let as = div.getElementsByTagName("a")
    let songs = []
    //
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        //if an <a> ends with .mp3 add it to songs[]
        if (element.href.endsWith(".mp3")) {
            let decodedHref = decodeURIComponent(element.href);
            //splits the href into two from /songs/ and we are taking the index 1 one coz its the name of song
            songs.push(decodedHref.split(`${folder}/`)[1].replaceAll("%20", " "))
        }
    }
    songol = document.querySelector(".songlist").getElementsByTagName("ol")[0]
    songol.innerHTML = ""
    for (const song of songs) {
        songol.insertAdjacentHTML("beforeend", `<li>
            <div class="info">
            <img src="img/music.svg" alt="">
            <div class="namecont">
            <div class="name">${song.split(".mp3")[0]}</div>
            <div class="artist">Artist</div>
            </div>
            <div class="playnow">
            <span>PlayNow</span>
            <img class="plays" src="img/play.svg" alt="">
            </div>
            </div>
            
            </li>`)
        }
        
        // main()
}


//initialises audio outside

const playMusic = (currentsong, folder) => {
    // stops the previous song
    document.querySelector(".circle").hidden = false
    document.querySelector(".voldiv").style.visibility = "visible"
    playbar.src = "/img/play.svg"
    audio.pause()
    //takes the currentsong and plays it from the url
    audio = new Audio(`/songs/${folder}/${currentsong}.mp3`)
    audio.play()
    if (localStorage.getItem("volume")) {
                
        audio.volume=Number(localStorage.getItem("volume"))
        document.querySelector(".range").value = Number(localStorage.getItem("volume"))*100

    }
    
    document.querySelector(".songtime").innerHTML ="00:00 / 00:00"
}

// adds title to song info (the playbar)
const addtitle = (currentsong) => {
    titlediv.innerHTML = `<p>${currentsong}</p>`;
}

const playbutton = () => {
    playbar.src = "/img/pause.svg"
    playbar.addEventListener("click", () => {
        if (audio.paused) {
            playbar.src = "/img/pause.svg"
            audio.play()
        }
        else {
            playbar.src = "/img/play.svg"
            audio.pause()
        }
    })
    //formats and displays audio's current time and total duration
    audio.addEventListener("timeupdate",()=>{
        document.querySelector(".songtime").innerHTML =`${convertTime(Math.floor(audio.currentTime))} / ${convertTime(Math.floor(audio.duration))}`
        document.querySelector(".circle").style.left = (audio.currentTime/audio.duration)*100 + "%"
        if (audio.currentTime == audio.duration) {
            index = index+1
            if (index >= document.querySelector(".songlist").getElementsByTagName("li").length) {
                index = 0;
            }
            
            element = document.querySelector(".songlist").getElementsByTagName("li")[index];
            if (currentElement !== element) {
                if (currentElement !== null) {
                    currentElement.removeEventListener("click", playbutton());
                }
        
                // Update the current song and other actions
                currentsong = element.querySelector(".name").innerHTML;
                playMusic(currentsong, folder);
                addtitle(currentsong);
                
                // Add the playbutton function to the new element
                playbutton();
                
                // Update the currently active element
                currentElement = element;
                
            }
        }
    })
}


async function main() {
    // console.log("main called");
    await getsongs(folder)
    //Takes all songs from songs[] and puts it in your libarary
    
        //adds event listner to all The songs in your libirary which takes the current song and then calls the playmusic function
        Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((element, i) => {
            element.addEventListener("click", () => {
                if (currentElement !== element) {
                    if (currentElement !== null) {
                        currentElement.removeEventListener("click", playbutton());
                    }
            
                    // Update the current song and other actions
                    index = i
                    currentsong = element.querySelector(".name").innerHTML;
                    playMusic(currentsong,folder);
                    addtitle(currentsong);
                    
                    // Add the playbutton function to the new element
                    element.addEventListener("click", playbutton());
                    
                    // Update the currently active element
                    currentElement = element;
                    
                }
            });
        });
        
        //adding an event listenner to seek bar
        document.querySelector(".seekbar").addEventListener("click", (e)=>{
            audio.currentTime = (e.offsetX/e.target.getBoundingClientRect().width) * audio.duration
            document.querySelector(".circle").style.left = (e.offsetX/e.target.getBoundingClientRect().width)*100 + "%"
        })
        document.querySelector(".circle").addEventListener("click", (e) => {
            e.stopPropagation();
        });
        
        
        document.querySelector(".hamburger").addEventListener("click",()=>{
            document.querySelector(".left").style.left = "-1%"
        })
        document.querySelector(".cross").addEventListener("click",()=>{
            document.querySelector(".left").style.left = "-100%"
        })
        
        
// volume button

        document.querySelector(".range").addEventListener("change", (e)=>{
            if (e.target.value ==0) {
                document.querySelector(".rangebtn").src = "img/mute.svg"
            }
            else{
                document.querySelector(".rangebtn").src = "img/volume.svg"
            }
            volume = (e.target.value)/100;
            audio.volume = Number(volume)
            localStorage.setItem("volume",volume)
        })
        //playlists

        
        
        
    }
    document.querySelector("#next").addEventListener("click",()=>{
        index = index+1
        if (index >= document.querySelector(".songlist").getElementsByTagName("li").length) {
            index = 0;
        }
        
        element = document.querySelector(".songlist").getElementsByTagName("li")[index];
        if (currentElement !== element) {
            if (currentElement !== null) {
                currentElement.removeEventListener("click", playbutton());
            }
    
            // Update the current song and other actions
            currentsong = element.querySelector(".name").innerHTML;
            playMusic(currentsong,folder);
            addtitle(currentsong);
            
            // Add the playbutton function to the new element
            playbutton();

            // Update the currently active element
            currentElement = element;
            
        }
    })
    document.querySelector("#previous").addEventListener("dblclick",()=>{
        index = index-1
        if (index < 0) {
            index = document.querySelector(".songlist").getElementsByTagName("li").length - 1;
        }
        
        element = document.querySelector(".songlist").getElementsByTagName("li")[index];
        if (currentElement !== element) {
            if (currentElement !== null) {
                currentElement.removeEventListener("click", playbutton());
            }
    
            // Update the current song and other actions
            currentsong = element.querySelector(".name").innerHTML;
            playMusic(currentsong,folder);
            addtitle(currentsong);
            
            // Add the playbutton function to the new element
            playbutton();
            
            // Update the currently active element
            currentElement = element;
            
        }
    })
    
    document.querySelector("#previous").addEventListener("click",()=>{
        if (audio.currentTime < 1) {
            index = index-1
        if (index < 0) {
            index = document.querySelector(".songlist").getElementsByTagName("li").length - 1;
        }
        
        element = document.querySelector(".songlist").getElementsByTagName("li")[index];
        if (currentElement !== element) {
            if (currentElement !== null) {
                currentElement.removeEventListener("click", playbutton());
            }
    
            // Update the current song and other actions
            currentsong = element.querySelector(".name").innerHTML;
            playMusic(currentsong,folder);
            addtitle(currentsong);
            
            // Add the playbutton function to the new element
            playbutton();
            
            // Update the currently active element
            currentElement = element;
            
        }
        }
        else{
            audio.currentTime = 0;
        }
    })

    Array.from(document.getElementsByClassName("card")).forEach( async(element,i) => {
        
        element.querySelector(".card-img").src =`songs/${element.dataset.folder}/cover.jpg`
        let infof = await fetch(`songs/${element.dataset.folder}/info.json`)
        let info =await infof.json()
        // console.log(info.title);
        document.querySelectorAll(".title")[i].innerHTML = info.title
        document.querySelectorAll(".desc")[i].innerHTML = info.description
        element.addEventListener("click",  ()=> {
            if (document.querySelector(".hamburger").style.visibility= "visible") {
                document.querySelector(".left").style.left = "-1%"
            }
            folder = element.dataset.folder;
            index =-1;
            main()
        })
    });
    main()