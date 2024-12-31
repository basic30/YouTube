const apiKey = 'AIzaSyA7k6glBajX2aK8yx49FhqDL43VesRIG64'; // Replace with your YouTube API key
let currentIndex = 0;
let playlist = [];
let isPlaying = false;
let player = null;

// Initialize the YouTube Player
function onYouTubeIframeAPIReady() {
    player = new YT.Player('hidden-player', {
        height: '0',
        width: '0',
        events: {
            onStateChange: onPlayerStateChange
        }
    });
}

// Fetch music based on search query
async function fetchMusic(query) {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${apiKey}`);
    const data = await response.json();
    displayMusic(data.items);
}

// Fetch related music
async function fetchRelatedMusic(videoId) {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${videoId}&type=video&key=${apiKey}`);
    const data = await response.json();

    if (data.items.length > 0) {
        // Pick a random video from the related videos
        const randomIndex = Math.floor(Math.random() * data.items.length);
        const randomVideo = data.items[randomIndex];
        playMusic(randomVideo, true); // Play the random related video
    }
}

// Display music tracks
function displayMusic(videos) {
    playlist = videos; // Save the playlist
    const musicList = document.getElementById('music-list');
    musicList.innerHTML = ''; // Clear previous content

    videos.forEach((video, index) => {
        const musicItem = document.createElement('div');
        musicItem.className = 'music-item';
        musicItem.innerHTML = `<h2>${video.snippet.title}</h2><p>${video.snippet.channelTitle}</p>`;
        musicItem.onclick = () => playMusic(video); // Play music on click
        musicList.appendChild(musicItem);
    });
}

// Play selected music
function playMusic(video, isRandom = false) {
    if (!isRandom) {
        const index = playlist.findIndex(item => item.id.videoId === video.id.videoId);
        currentIndex = index >= 0 ? index : 0; // Update the current index
    }
    const videoId = video.id.videoId;
    const trackTitle = video.snippet.title;
    const channelLogo = video.snippet.thumbnails.default.url; // Get channel logo

    // Load the selected video into the YouTube player
    player.loadVideoById(videoId);
    player.setPlaybackQuality('small'); // Set video quality to low
    document.getElementById('current-track').textContent = trackTitle; // Update track name
    document.getElementById('channel-logo').src = channelLogo; // Set channel logo
    isPlaying = true;
    updatePlayPauseButton();
}

// Play the next track
function playNext() {
    if (currentIndex < playlist.length - 1) {
        currentIndex++;
        playMusic(playlist[currentIndex]);
    } else {
        // If at the end of the playlist, fetch and play random related music
        const currentVideoId = playlist[currentIndex]?.id.videoId;
        if (currentVideoId) fetchRelatedMusic(currentVideoId);
    }
}

// Play the previous track
function playPrevious() {
    if (currentIndex > 0) {
        currentIndex--;
        playMusic(playlist[currentIndex]);
    } else {
        currentIndex = playlist.length - 1; // Loop back to the last track
        playMusic(playlist[currentIndex]);
    }
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

// Update the Play/Pause button text
function updatePlayPauseButton() {
    const playPauseButton = document.getElementById('play-pause');
    playPauseButton.innerHTML = isPlaying ? '⏸️' : '▶️';
}

// Handle player state changes
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        playNext(); // Automatically play the next track or random related music when the current track ends
    }
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

// Event listeners for player controls
document.getElementById('play-pause').addEventListener('click', togglePlayPause);
document.getElementById('next').addEventListener('click', playNext);
document.getElementById('prev').addEventListener('click', playPrevious);
