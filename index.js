const blu = require('balaan_utils');
const {slack} = blu;

const dotenv = require('dotenv').config();
const { Client } = require('@notionhq/client');

// Init client
const notion = new Client({
  auth: process.env.NOTION_TOKEN
});

const database_id = process.env.NOTION_DATABASE_ID;

async function getNews() {
  const payload = {
    path: `databases/${database_id}/query`,
    method: 'POST',
  };

  const { results } = await notion.request(payload);

  const news = results.map(page => {
    // console.log(page)
    if (!page.properties['날짜'].date) return;
    return {
      id: page.id,
      title: page.properties['이름'].title[0].text.content,
      date: page.properties['날짜'].date.start,
      url: page.url
    };
  });

  return news;
}
function today() {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return {
    today: `${year}-${month}-${day}`,
    month,
    day
  };
}

async function getNotionPage(url) {
  // const results = await notion.request(payload)
  const { results } = await notion.blocks.children.list({
    block_id: url
  });
  const contents = results.map(({paragraph}) => paragraph.text[0] ? paragraph.text[0].text : '').filter(e => e);

  // console.log(contents)
  const news = [];
  let title = {title: '', sub: []};
  let sub = {title: '', link: '', text: ''};
  for (const {content, link} of contents) {
    if (content.match(/■/g)) {
      news.push(title);
      title = {title: content.replace('■', ''), sub: []};
    } else if (link) {
      sub = {title: content, link: link.url, text: ''};
    } else {
      sub.text = content.replace('>>', '');
      title.sub.push(sub);
    }
  }
  news.push(title);
  news.shift(); // 앞 공백 제거.
  return news;
}

(async function() {
  const data = await getNews();
  const [lastData] = data;
  const {url} = lastData;
  const lastDay = today();
  const pageUrl = url.replace(/https:\/\/www.notion.so\/(\d{2}-){3}/i, '');

  if (lastData.date === lastDay.today) {
    // console.log(`[${lastDay.month}월 ${lastDay.day}일 오늘의 뉴스](${pageUrl})`);
    const news = await getNotionPage(pageUrl);
    // 나중에 에러처리하기.
    let text = `*${lastDay.today} 오늘의 뉴스*\n`;
    for (const {title, sub} of news) {
      text += `\n•  ${title} (외 ${sub.length - 1}건)\n<${sub[0].link}|${sub[0].title}>\n> ${sub[0].text}
      `;
    }
    text += `\n:arrow_right: *<${url}|전체 기사 보러가기>* :arrow_left:`;

    await slack.chat('test_news', {
      type: 'mrkdwn',
      text: text,
      username: 'FeedBot'
    });
  } else {
    console.log('오늘의 뉴스가 없거나 업로드 전입니다.');
  }
})();
