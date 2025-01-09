const apiKey = '92dbf5f478msheb6cdc59c125e22p1ef8f7jsna695e4aa010e'; // Replace with your RapidAPI Key
let player; // YouTube IFrame Player instance
let currentIndex = 0;
let isPlaying = false;
let tempPlaylist = []; // Temporary playlist array

// Load the YouTube IFrame API and create the hidden player
function onYouTubeIframeAPIReady() {
    player = new YT.Player('hidden-player', {
        height: '0',
        width: '0',
        events: {
            onReady: () => console.log('YouTube Player is ready'),
            onStateChange: onPlayerStateChange,
        },
    });
}

// Handle YouTube player state changes
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        playNext();
    }
}

// Fetch music based on search query using RapidAPI
async function fetchMusic(query) {
    try {
        const response = await fetch('https://youtube-music4.p.rapidapi.com/search', {
            method: 'GET',
            headers: {
                'x-rapidapi-key': apiKey, // RapidAPI Key
                'x-rapidapi-host': 'youtube-music4.p.rapidapi.com',
            },
            params: {
                q: query,
                maxResults: 2
            }
        });
        const data = await response.json();
        displayMusic(data.result); // Assuming the results are in `data.result`
    } catch (error) {
        console.error('Error fetching music:', error);
    }
}

// Display music tracks in the list
function displayMusic(videos) {
    const musicList = document.getElementById('music-list');
    musicList.innerHTML = ''; // Clear previous content

    videos.forEach((video) => {
        const musicItem = document.createElement('div');
        musicItem.className = 'music-item';
        musicItem.innerHTML = `<h2>${video.title}</h2><p>${video.artist}</p>`;
        musicItem.onclick = () => addToTempPlaylist(video); // Add to playlist on click
        musicList.appendChild(musicItem);
    });
}

// Play selected music
function playMusic(video) {
    const videoId = video.videoId;
    player.loadVideoById(videoId);
    document.getElementById('current-track').textContent = video.title;
    document.getElementById('channel-logo').src = video.thumbnail; // Set channel logo

    // Show the player
    document.getElementById('music-player').style.display = 'flex';

    isPlaying = true;
    updatePlayPauseButton();
}

// Play the next track in the playlist
function playNext() {
    if (currentIndex < tempPlaylist.length - 1) {
        currentIndex++;
        playMusic(tempPlaylist[currentIndex]);
    } else {
        console.log('End of playlist');
    }
}

// Play the previous track in the playlist
function playPrevious() {
    if (currentIndex > 0) {
        currentIndex--;
        playMusic(tempPlaylist[currentIndex]);
    }
}

// Add a video to the temporary playlist
function addToTempPlaylist(video) {
    if (!tempPlaylist.some((item) => item.videoId === video.videoId)) {
        tempPlaylist.push(video);
        savePlaylistToLocalStorage();
        updateTempPlaylistUI();
    }
}

// Remove a track from the temporary playlist
function removeFromTempPlaylist(index) {
    tempPlaylist.splice(index, 1);
    savePlaylistToLocalStorage();
    updateTempPlaylistUI();
}

// Update the UI to display the temporary playlist
function updateTempPlaylistUI() {
    const tempPlaylistEl = document.getElementById('temp-playlist');
    tempPlaylistEl.innerHTML = '';

    tempPlaylist.forEach((video, index) => {
        const playlistItem = document.createElement('div');
        playlistItem.className = 'playlist-item';
        playlistItem.innerHTML = `
            <h3>${video.title}</h3>
            <button onclick="removeFromTempPlaylist(${index})">Remove</button>
        `;
        playlistItem.onclick = () => {
            currentIndex = index; // Update the current index
            playMusic(video);
        };
        tempPlaylistEl.appendChild(playlistItem);
    });
}

// Save the playlist to localStorage
function savePlaylistToLocalStorage() {
    localStorage.setItem('tempPlaylist', JSON.stringify(tempPlaylist));
    console.log('Playlist saved to localStorage');
}

// Load the playlist from localStorage
function loadPlaylistFromLocalStorage() {
    const savedPlaylist = localStorage.getItem('tempPlaylist');
    if (savedPlaylist) {
        tempPlaylist = JSON.parse(savedPlaylist);
        updateTempPlaylistUI();
        console.log('Playlist loaded from localStorage');
    }
}

// Toggle playlist visibility
const togglePlaylistBtn = document.getElementById('toggle-playlist-btn');
const playlistSection = document.getElementById('playlist-section');

togglePlaylistBtn.addEventListener('click', () => {
    if (playlistSection.style.display === 'none') {
        playlistSection.style.display = 'block';
        togglePlaylistBtn.textContent = 'Hide Playlist';
    } else {
        playlistSection.style.display = 'none';
        togglePlaylistBtn.textContent = 'Your Playlist';
    }
});

// Update play/pause button state
function updatePlayPauseButton() {
    const playPauseButton = document.getElementById('play-pause');
    playPauseButton.textContent = isPlaying ? '⏸️' : '▶️';
}

// Play/pause button event
document.getElementById('play-pause').addEventListener('click', () => {
    if (isPlaying) {
        player.pauseVideo();
        isPlaying = false;
    } else {
        player.playVideo();
        isPlaying = true;
    }
    updatePlayPauseButton();
});

// Previous button event
document.getElementById('prev').addEventListener('click', () => {
    playPrevious();
});

// Next button event
document.getElementById('next').addEventListener('click', () => {
    playNext();
});

// Search button event
document.getElementById('search-button').addEventListener('click', () => {
    const query = document.getElementById('search').value;
    if (query.trim()) {
        fetchMusic(query);
    }
});

// Clear playlist button
document.getElementById('clear-playlist').addEventListener('click', () => {
    tempPlaylist = [];
    savePlaylistToLocalStorage();
    updateTempPlaylistUI();
    console.log('Playlist cleared');
});

// Hide player on page load
document.getElementById('music-player').style.display = 'none';

// Load playlist on page load
window.onload = loadPlaylistFromLocalStorage;
