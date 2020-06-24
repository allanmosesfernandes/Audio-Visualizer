import { hslToRgb } from './utils';
// const files = Object.values(require('/*.mp3'));
const files = Object.values(require('./assets/audio/*.mp3'));
const audios = files.map(v => new Audio(v));
const musicContainer = document.getElementById('music-container');
const audio = document.getElementById('audio');
const title = document.getElementById('title')
const cover = document.getElementById('cover-img');
const play = document.getElementById('play');
const prev = document.getElementById('prev');
const next = document.getElementById('next');
const faPlay = document.getElementById('fa-play');
const artist = document.getElementById('artist');

// const chandu = IloveyouRiyaaaaaaaaaaaaat
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress');
////Make an Array of Songs b
const songs = ['Border - Marbman','summer','ukulele'];
const artists = ['Marbman', 'Chomdu', 'Lodu'];
//Load Song Index
let songIndex = 0;
    audios.forEach(v => v.play());

console.log(audio);
//Functiion to Load Song 

loadSong(songs[songIndex]);

function loadSong(song) {
    title.innerText = `${song}`;
    cover.src = `images/${song}.png`;
    audio.src = `music/${song}.mp3`;
}

    // audios.forEach(v => v.play());


///Event listener
function playSong() {
    musicContainer.classList.add('play');
    audios.forEach(v => v.play());

    // audio.play();
    faPlay.classList.remove('fa-play');
    faPlay.classList.add('fa-pause');
}

function pauseSong() {
    musicContainer.classList.remove('play');
    audios.forEach(v => v.pause());

    audio.pause();
    faPlay.classList.remove('fa-pause');
    faPlay.classList.add('fa-play');
}

play.addEventListener('click', () => {

    const isSongPlaying = musicContainer.classList.contains('play');
    console.log(musicContainer);

    console.log(isSongPlaying);
    isSongPlaying ? pauseSong() : playSong();
})

function nextSong() {
    songIndex++;
    songIndex > (songs.length -1) ? songIndex = 0  : songIndex;
    loadSong(songs[songIndex]);
    playSong();
}

function prevSong() {
    songIndex--;
    songIndex < 0 ? (songIndex = songs.length -1) : songIndex;
    loadSong(songs[songIndex]);
    playSong();
}


function updateProgress(e) {
    const {duration, currentTime} = e.srcElement;
    const progressPercent = (currentTime/duration) * 100;
    progressBar.style.width = `${progressPercent}%`
    // console.log(e.duration);
}


function songSlide(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;

    audio.currentTime = (clickX / width) * duration;
    // console.log(width,clickX);
}
// audio.addEventListener('timeupdate', updateProgress)
// next.addEventListener('click', nextSong);
// prev.addEventListener('click', prevSong);

// progressContainer.addEventListener('click', songSlide)

////=========SOng Ends =======///

// audio.addEventListener('ended', nextSong);

//tl.timeScale(0.25)
//ScrubGSAPTimeline(tl)


const WIDTH = 1500;
const HEIGHT = 1500;
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = WIDTH;
canvas.height = HEIGHT;
let analyzer;
let bufferLength;

function handleError(err) {
  console.log('You must give access to your mic in order to proceed');
}

async function getAudio() {
  const stream = await navigator.mediaDevices
    .getUserMedia({ audio: true })
    .catch(handleError);
  const audioCtx = new AudioContext();
  analyzer = audioCtx.createAnalyser();
  const source = audioCtx.createMediaStreamSource(stream);
  source.connect(analyzer);
  // How much data should we collect
  analyzer.fftSize = 2 ** 8;
  // pull the data off the audio
  // how many pieces of data are there?!?
  bufferLength = analyzer.frequencyBinCount;
  const timeData = new Uint8Array(bufferLength);
  const frequencyData = new Uint8Array(bufferLength);
  drawTimeData(timeData);
  drawFrequency(frequencyData);
}

function drawTimeData(timeData) {
  // inject the time data into our timeData array
  analyzer.getByteTimeDomainData(timeData);
  // now that we have the data, lets turn it into something visual
  // 1. Clear the canvas TODO
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  // 2. setup some canvas drawing
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#ffc600';
  ctx.beginPath();
  const sliceWidth = WIDTH / bufferLength;
  let x = 0;
  timeData.forEach((data, i) => {
    const v = data / 128;
    const y = (v * HEIGHT) / 2;
    // draw our lines
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    x += sliceWidth;
  });

  ctx.stroke();

  // call itself as soon as possible
  requestAnimationFrame(() => drawTimeData(timeData));
}

function drawFrequency(frequencyData) {
  // get the frequency data into our frequencyData array
  analyzer.getByteFrequencyData(frequencyData);
  // figure out the bar width
  const barWidth = (WIDTH / bufferLength) * 2.5;
  let x = 0;
  frequencyData.forEach(amount => {
    // 0 to 255
    const percent = amount / 255;
    const [h, s, l] = [360 / (percent * 360) - 0.5, 0.8, 0.5];
    const barHeight = HEIGHT * percent * 0.5;
    // TODO: Convert the colour to HSL TODO
    const [r, g, b] = hslToRgb(h, s, l);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
    x += barWidth + 2;
  });

  requestAnimationFrame(() => drawFrequency(frequencyData));
}

getAudio();
