// const notion = require('./notion');

// const isTitle = ({content}) => content.includes('■');
// const isDesc = ({content}) => content.includes('>>');

// /**
//  * 현재 날짜와 형식의 맞는 데이터 리턴
//  * @return {{month: string, year: number, today: string, day: string}}
//  */
// const today = () => {
//   const date = new Date();
//   return {
//     today: '2022-02-22',
//     year: date.getFullYear(),
//     month: (date.getMonth() + 1).toString().padStart(2, '0'),
//     day: date.getDate().toString().padStart(2, '0'),
//   };
// };

// /**
//  * id, title, date, url, pageId 필요한 데이터만 추출 후 배열로 반환하는 함수
//  * @param {array} database 가공되지 않은 원본 데이터베이스들
//  * @return {*}
//  */
// const extractData = database => {
//   return database.map(page => {
//     if (!page.properties['날짜'].date) return;
//     return {
//       id: page.id,
//       title: page.properties['이름'].title[0].text.content,
//       date: page.properties['날짜'].date.start,
//       url: page.url,
//       pageId: page.url.replace(/https:\/\/www.notion.so\/(\d{2}-){3}/i, '')
//     };
//   });
// };

// /**
//  * 빈 페이지들을 제거하고 카테고리별로 섹션을 추출하는 함수
//  * @param {Array} blocks 가공되지 않은 페이지들 배열
//  * @return {Promise<*[]>}
//  */
// const extractBlocks = async blocks => {
//   try {
//     // 빈 블럭 제거.
//     const contents = blocks.map(({paragraph}) => paragraph.text[0] ? paragraph.text[0].text : '').filter(e => e);

//     // ■ <- 문자를 기준으로 섹션을 나눈다.
//     const sectionIndexList = [];
//     contents.forEach((c, i) => {
//       if (isTitle(c)) {
//         sectionIndexList.push(i);
//       }
//     });

//     // 나눈 섹션으로 객체 만들기
//     const news = [];
//     for (let i = 0; i < sectionIndexList.length; i++) {
//       const categoryData = contents.slice(sectionIndexList[i], sectionIndexList[i + 1]);
//       const {content: title} = categoryData.shift();

//       const newsForm = {
//         title: title.replace('■', ''),
//         sub: []
//       };
//       let subSW = false;
//       let blocks = [];
//       for (const data of categoryData) {
//         // >> 설명 블록이 있으면 sub에 넣는다.
//         if (isDesc(data)) {
//           blocks.push({
//             type: 'desc',
//             text: data.content.replace('>>', ''),
//           });
//           newsForm.sub.push(blocks);
//           blocks = [];
//           subSW = true;
//         } else {
//           blocks.push({
//             type: 'link',
//             text: data.content,
//             url: data.link.url,
//           });
//         }
//       }
//       if (!subSW) newsForm.sub.push(blocks);

//       news.push(newsForm);
//     }

//     return news;
//   } catch (err) {
//     const t = today();
//     console.error(`${t.today} 페이지 파싱 중 에러가 발생했습니다: `, err.message);
//     return [];
//   }
// };

// /**
//  * 블록을 슬랙에 맞게 가공하여 텍스트로 반환하는 함수
//  * @param {Object[]} blocks Page에 있는 블록들이 가공된 상태
//  * @param {string} url 전체 기사를 위한 URL
//  * @return {string}
//  */
// const blocksToSlack = (blocks, url) => {
//   const t = today();
//   let text = `*${t.year}년 ${t.month}월 ${t.day}일 오늘의 뉴스*\n`;

//   for (const {title, sub} of blocks) {
//     console.log(title, sub)
//     const subText = sub[0].map(e => {
//       if (e.type === 'link') return `<${e.url}|${e.text}>`;
//       else return `> ${e.text}\n\n`;
//     }).join('\n');
//     text += `\n•  ${title} (외 ${sub.length - 1}건)\n` + subText;
//   }
//   text += `\n\n:arrow_right: *<${url}|전체 기사 보러가기>* :arrow_left:`;
//   return text;
// };

// const meta = module.exports = {
//   /**
//    *  1. notion.getDatabase 호출해서 데이터베이스 raw data를 받아온다.
//    *  2. extractData 함수로 가공된 데이터베이스 데이터를 반환한다.
//    *  3. 가장 최근 데이터(lastData)와 날짜 조건비교
//    *  4. notion.getPageBlocks로 blocks raw data를 받아온다.
//    *  5. extractBlocks 가공된 blocks 데이터를 가져온다.
//    *  6. 메세지 포맷 맞춰서 슬랙 전송
//    * @return {Promise<void>}
//    */
//   async slack() {
//     const DATABASE_ID = 'fed74567446843f3b51fc7e2f2e49316';

//     const {data: rawDB} = await notion.getDatabase({
//       database_id: DATABASE_ID,
//       page_size: 1,
//     });
//     const {results: rawDatabase} = rawDB;

//     const [lastData] = extractData(rawDatabase);
//     const t = today();

//     if (lastData.date !== t.today) {
//       console.log('뉴스 없음');
//       // return await slack.chat('test_news', {
//       //   text: `${t.today} 오늘의 뉴스가 없거나 업로드 전입니다. 수동으로 호출 해주세요.`,
//       //   username: 'NewsBot'
//       // });
//     }

//     const {data: rawPB} = await notion.getPageBlocks(lastData.pageId);
//     const {results: rawPageBlocks} = rawPB;
//     const blocks = await extractBlocks(rawPageBlocks);
//     const slackText = blocksToSlack(blocks, lastData.url);
    
//     console.log('헤이');
//     // await slack.chat('_balaaneer', {
//     //   type: 'mrkdwn',
//     //   text: slackText,
//     //   username: 'NewsBot'
//     // });
//   }
// };

// (async ()=>{
//   await meta.slack();
// })();

const fs = require('fs');
const { argv } = require('process');

/**
 * fs 를 통해 폴더 내 파일을 객체 배열로 만드는 함수
 * @param {String} dir 폴더 주소
 * @param {Array} exception 제외할 폴더 및 배열
 * @param {Boolean} all 폴더 내 파일까지 가지고 올지 여부
 * @param {Array} files_ 데이터가 저장 될 변수
 * @param {String} origin 기본 Origin 주소
 * @returns 
 */
const getFiles = (dir, exception, all, files_, origin) => {
  let files = fs.readdirSync(dir);
  for (let i in files){
    let name = dir + '/' + files[i];
    const path = name.replace(origin+'/', '');
    if(!exception.includes(files[i])){
      if (fs.statSync(name).isDirectory()){
        files_.push({type:'tree', text:files[i], path});
        getFiles(name, exception, all, files_,origin);
      } else if (all){
        files_.push({type:'blob', text:files[i], path});
      }
    }
  }
  return files_;
}

/**
 * 포맷 형식의 맞는 객체를 넣을 시 String 형태의 Tree 문자열을 반환
 * {
 *  폴더명1:{
 *    파일명1: {type:'file'},
 *    파일명2: {type:'file'},
 *  },
 *  폴더명2:{
 *    파일명1: {type:'file'},
 *    파일명2: {type:'file'},
 *  },
 *  파일명1: {type:'file'},
 *  파일명2: {type:'file'},
 * } 
 * @param {Object} tree 객체 배열을 가공한 객체를 넣는다.
 * @returns 
 */
const treeCreate = (tree) => {
  let text = '';
  const recursionFolder = (tree, branchArray) => {
    const keys = Object.keys(tree);
    let count = keys.length;
    
    keys.forEach(key => {
      branchArray.forEach(e => {
        if(e>1) text+=' ┃  ';
        if(e===1) text+='    ';
      })
      if(count>1) text+= ' ┣━';
      if(count===1) text+= ' ┗━'
      if(tree[key].type === 'file'){
        text+=` 📜 ${key}\n`;
      } else{
        text+=` 📂 ${key}\n`;
        recursionFolder(tree[key], [...branchArray, count]);
      }
      
      count--;
    })
  }
  recursionFolder(tree, []);
  return text;
}

/**
 * 객체 배열을 가공하여 객체로 만든다.
 * @param {Array} tree 객체 배열
 * @returns
 * {
 *  폴더명1:{
 *    파일명1: {type:'file'},
 *    파일명2: {type:'file'},
 *  },
 *  폴더명2:{
 *    파일명1: {type:'file'},
 *    파일명2: {type:'file'},
 *  },
 *  파일명1: {type:'file'},
 *  파일명2: {type:'file'},
 * } 
 */
const treeObjectCreate = (tree) => {
  const treeObject = [];
  tree.forEach(e => {
    const {type, path} = e;
    let pivot = treeObject;
    if(type === 'tree'){
      const folder = path.split('/');
      folder.forEach(e => {
        pivot[e] = pivot[e] || {};
        pivot = pivot[e];
      });
    } else {
      const folder = path.split('/');
      const file = folder.pop();
      folder.forEach(e => {
        pivot = pivot[e];
      });
      pivot[file] = {type:'file'};
    }
  })
  return treeObject;
}

module.exports = {
/**
 * 트리를 생성 하는 함수
 * ex) getTree(경로, 저장경로, 제외배열 = [], 전체 여부 = true)
 * @param {String} folder Tree 를 그릴 경로
 * @param {String} savePath 저장 경로 'C:/test/tset.txt' or 'test.txt' 절대 경로 or 상대 경로
 * @param {Array} exception 제외할 폴더 or 파일이 담긴 배열
 * @param {Boolean} all 폴더 내 파일까지 그릴지 여부
 */
  getTree: (folder = __dirname, {savePath = 'Tree.txt', exception = [], all = true} = {}) => {
    if (!savePath.includes(':')){
      savePath = `./${savePath}`;
    }
    
    console.log(__dirname);
    const fileArray = getFiles(folder,exception,all,[],folder);
    // 문자 내 포함되어 있는 숫자기준 정렬
    fileArray.sort((a, b) => {
      let aNumber = a.text.match(/(\d+)/g);
      aNumber = aNumber ? Number(aNumber[0]) : 0;
      let bNumber = b.text.match(/(\d+)/g);
      bNumber = bNumber ? Number(bNumber[0]) : 0;
      return aNumber - bNumber
    });
    // 폴더 정렬
    fileArray.sort((a, b) => {
      if (a.type < b.type) {
        return 1;
      }
      if (a.type > b.type) {
        return -1;
      }
      // 이름이 같을 경우
      return 0;
    })
    const treeObject = treeObjectCreate(fileArray);

    // 파일 배출 뿡!
    fs.writeFile(savePath, treeCreate(treeObject, []), (err) => {
      if(err){
        console.log(err);
      }
      console.log('성공');
    })
  }
}

// (async ()=> {
//   // console.log(getTree('C:/Users/BALAAN/WebstormProjects/new-feed/shops', {}));
// })();