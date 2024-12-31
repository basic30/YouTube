const apiKey = 'AIzaSyA7k6glBajX2aK8yx49FhqDL43VesRIG64'; // Replace with your YouTube API key
let player; // YouTube IFrame Player instance
let currentIndex = 0;
let isPlaying = false;
let playlist = [];

// Load the YouTube IFrame API and create the hidden player
function onYouTubeIframeAPIReady() {
    player = new YT.Player('hidden-player', {
        height: '0', // Hidden player
        width: '0',  // Hidden player
        events: {
            onReady: () => console.log('YouTube Player is ready'),
            onStateChange: onPlayerStateChange,
        },
    });
}

// Handle YouTube player state changes
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        // Set playback quality to "small" (low quality)
        player.setPlaybackQuality('small');
    } else if (event.data === YT.PlayerState.ENDED) {
        playNext(); // Automatically play the next song when the current one ends
    }
}

// Fetch music based on search query
async function fetchMusic(query) {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${apiKey}`);
    const data = await response.json();
    displayMusic(data.items);
}

// Display music tracks in the list
function displayMusic(videos) {
    playlist = videos; // Save the playlist
    const musicList = document.getElementById('music-list');
    musicList.innerHTML = ''; // Clear previous content

    videos.forEach((video, index) => {
        const musicItem = document.createElement('div');
        musicItem.className = 'music-item';
        musicItem.innerHTML = `<h2>${video.snippet.title}</h2><p>${video.snippet.channelTitle}</p>`;
        musicItem.onclick = () => playMusic(index); // Play music on click
        musicList.appendChild(musicItem);
    });
}

// Play selected music
function playMusic(index) {
    currentIndex = index;
    const videoId = playlist[index].id.videoId;
    const trackTitle = playlist[index].snippet.title; // Get track title
    player.loadVideoById(videoId); // Load the video into the hidden player
    document.getElementById('current-track').textContent = trackTitle; // Update track name
    isPlaying = true;
    updatePlayPauseButton();
}

// Play/Pause toggle
function togglePlayPause() {
    if (isPlaying) {
        player.pauseVideo(); // Pause the video
    } else {
        player.playVideo(); // Play the video
    }
    isPlaying = !isPlaying;
    updatePlayPauseButton();
}

// Play the next track
function playNext() {
    if (currentIndex < playlist.length - 1) {
        playMusic(currentIndex + 1);
    }
}

// Play the previous track
function playPrevious() {
    if (currentIndex > 0) {
        playMusic(currentIndex - 1);
    }
}

// Update the Play/Pause button text
function updatePlayPauseButton() {
    const playPauseButton = document.getElementById('play-pause');
    playPauseButton.innerHTML = isPlaying ? '⏸️' : '▶️';
}

// Event listener for search button
document.getElementById('search-button').addEventListener('click', () => {
    const query = document.getElementById('search').value;
    if (query.trim().length > 0) {
        fetchMusic(query);
    } else {
        document.getElementById('music-list').innerHTML = ''; // Clear music list if input is empty
    }
});

// Play/Pause button event listener
document.getElementById('play-pause').addEventListener('click', togglePlayPause);

// Next button event listener
document.getElementById('next').addEventListener('click', playNext);

// Previous button event listener
document.getElementById('prev').addEventListener('click', playPrevious);
