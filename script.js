function generateTags() {
  const keywords = document.getElementById('keywords').value.trim();
  const platform = document.getElementById('platform').value;
  if (!keywords) return;

  const baseTags = keywords.split(',').map(tag => tag.trim().replace(/\s+/g, ''));

  const hashtags = baseTags.map(tag => `#${tag.toLowerCase()}`).join(' ');
  document.getElementById('hashtags').textContent = hashtags;

  const videoTags = baseTags.map(tag => tag.toLowerCase()).join(', ');
  document.getElementById('videotags').textContent = platform === 'youtube' ? videoTags : '';
  document.getElementById('videotags-block').style.display = platform === 'youtube' ? 'block' : 'none';
}

function copyHashTags() {
  const text = document.getElementById('hashtags').textContent;
  navigator.clipboard.writeText(text);
  alert('Hashtags copied!');
}

function copyVideoTags() {
  const text = document.getElementById('videotags').textContent;
  navigator.clipboard.writeText(text);
  alert('Video tags copied!');
}

function resetFields() {
  document.getElementById('keywords').value = '';
  document.getElementById('hashtags').textContent = '';
  document.getElementById('videotags').textContent = '';
  document.getElementById('videotags-block').style.display = 'none';
}
