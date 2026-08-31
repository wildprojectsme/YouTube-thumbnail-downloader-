import { FaqItem } from '../types';

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'how-to-download',
    question: 'How do I download a YouTube thumbnail?',
    answer:
      'Simply copy the link of any YouTube video, paste it into the input box above, and click "Get Thumbnail". Choose your preferred resolution (such as Maximum Resolution or High Definition) and click the "Download" button to save the image to your device.',
  },
  {
    id: 'youtube-shorts',
    question: 'Can I download a thumbnail from a YouTube Short?',
    answer:
      'Yes! Our tool fully supports YouTube Shorts URLs (e.g. https://www.youtube.com/shorts/VIDEO_ID). Just paste the short link, and it will extract the video ID and display all thumbnail sizes.',
  },
  {
    id: 'copy-direct-url',
    question: 'Can I copy the direct thumbnail URL?',
    answer:
      'Yes. Each thumbnail card provides a dedicated "Copy Link" button and displays the direct img.youtube.com URL. Clicking "Copy Link" instantly copies the direct URL to your clipboard.',
  },
  {
    id: 'highest-quality',
    question: 'What is the highest YouTube thumbnail quality?',
    answer:
      'The highest possible quality is Maximum Resolution (maxresdefault.jpg), which offers 1280 × 720 pixels (HD/1080p). If a creator did not upload an HD thumbnail, the system will provide High Quality (hqdefault.jpg at 480 × 360 px) or Standard Definition.',
  },
  {
    id: 'is-it-free',
    question: 'Is this tool free?',
    answer:
      'Yes, YouTube Thumbnail Downloader is 100% free with unlimited thumbnail previews and downloads. There are no paywalls, hidden fees, or registration requirements.',
  },
  {
    id: 'install-app',
    question: 'Do I need to install an app?',
    answer:
      'No installation or browser extension is required. The tool runs directly in any modern mobile or desktop web browser, including Chrome, Safari, Firefox, Edge, and Android/iOS browsers.',
  },
  {
    id: 'youtube-account',
    question: 'Do I need a YouTube account?',
    answer:
      'No YouTube account, login, or Google authentication is needed. You can download thumbnails from any publicly accessible YouTube video immediately without signing in.',
  },
];
