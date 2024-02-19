const replaceImage ="noonatimes2.png";
const apiKey ='4c2d201c758b4664ab2eeaa863a7bbee'
let country = 'kr'

let url = `https://newsapi.org/v2/top-headlines?country=kr&apiKey=${apiKey}`;
let url2 = 'http://times-node-env.eba-appvq3ef.ap-northeast-2.elasticbeanstalk.com/top-headlines'
let url3 = `https://grand-gumdrop-215732.netlify.app/top-headlines`

let newsList=[]
let totalResults = 0;

let page =1
const pageSize =10 // 한페이지에 보여질 item갯수
const groupSize =5
let group   // 리스트자료 [1,2,3,4,5] 식
let groups  // [ [1,2,3,4,5], [6,7,8,9,10],......]
let groupIndex =0;
let currentIndex = 0;     //해당그룹에서 위치 인덱스 [1,2,3,4,5] 에서
// 2 페이지를 보여주고 있다면 currentIndex는 1
let totalPages =0;

const menus = document.querySelectorAll('.menus button')
menus.forEach(button => addEventListener('click', onMenuClick))
console.log(menus)


function onMenuClick(e){
    const category = e.target.id
    // url =`https://newsapi.org/v2/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`
    url3 =`https://grand-gumdrop-215732.netlify.app/top-headlines?country=${country}&category=${category}` 
    getNews();
}
function search(){
    const keyword = input.value;
    input.value =''  
    url3 =`https://grand-gumdrop-215732.netlify.app/top-headlines?country=${country}&q=${keyword}` 
    getNews()
}

function checkInput(word){
     // 정규 표현식을 사용하여 한글/영문 여부를 판별
    var isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(word);
    var isEnglish = /^[a-zA-Z]+$/.test(word);
    if(isKorean) {
        country = 'kr';
        console.log(country);
        return 'kr';
    }
    if(isEnglish) {
        country = 'us';
        console.log(country)
        return 'us';
    }
}


function render(){    
    // let index = page -1;
    const newsBoard = document.querySelector('#news-board')
    newsBoard.innerHTML =''; //비우고 시작
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML =''// 기존내용 삭제
    const newsHTML = newsList.map(news => 
        `<div class="row item">
            <div class="col-lg-4">
                        <img src=${news.urlToImage?? replaceImage}  />
                    </div>
                    <div class="col-lg-8">
                        <h2 class='title' onclick="getDetail('${news.url}')">${news.title}</h2>
                        <p class="content">${news.description}</p>
                        <div>
                            ${news.source.name} : ${news.publishedAt} 
                        </div>
                    </div>
            </div>
        </div>
    `).join('')
    newsBoard.innerHTML = newsHTML;
    pagination.innerHTML = makePaginationHTML()

    // 바뀐 버튼 상태를 반영하기
    const prev = document.querySelector('#prev')
    const prevPage = document.querySelector('#prev-page')
    const next = document.querySelector('#next')
    const nextPage = document.querySelector('#next-page')

    const endIndexOfTheGroup = group.length-1  //해당그룹의 마지막 인덱스

    // prev next 등 비활성화 여부
    if(group.length ==1){
        // 단 한개의 아이템만 있는 경우
        prev.disabled = true;
        next.disabled = true;
        prevPage.disabled =true;
        nextPage.disabled =true;
    }

    if(currentIndex ==0){
        prev.disabled =true;
        
    } else if(currentIndex == endIndexOfTheGroup){
        next.disabled = true;
    } 
    if(groupIndex ==0){
        prevPage.disabled = true;
    } else if(groupIndex == groups.length-1){
        nextPage.disabled = true;
    }

    // 현재 페이지 버튼 활성화(진하게)
    const pageButtons = document.querySelectorAll('.page-btn')
    for( let pageButton of pageButtons){
        if(pageButton.innerText == page.toString()){
            pageButton.classList.add('active')
        } else{
            pageButton.classList.remove('active')
        }
    }
    console.log('page :', page)
    console.log('currentIndex :', currentIndex)
    console.log('groupIndex :', groupIndex)
    console.log('group :', group)

}

function getDetail(url){
     window.location.href = url;
}

function errorRender(message){
    const newsBoard = document.querySelector('#news-board')
    newsBoard.innerHTML ='';
    const errorHTML = `
        <div class="alert alert-danger" role="alert">
            ${message}
        </div>
    `;
    newsBoard.innerHTML= errorHTML;
    document.querySelector('.pagination').innerHTML = ""
}

function makeGroups(){
    totalPages = Math.ceil(totalResults / pageSize)
    console.log(totalPages)
    groups =[]
    let list =[]
    for(let i=1; i<=totalPages; i++){
        
        if( i % groupSize != 0){
              list.push(i)   // [1]
        } else{           // 5의 배수
            list.push(i)  // [....5]까지 넣음
            groups.push(list)   // [1,2,3,4,5]
            list =[] // 다시 비움
        }
    
        if ( i == totalPages && list.length >0){
            groups.push(list)
        }
    }


    console.log('groups : ', groups)
    console.log('groups.length : ', groups.length)
    return groups
}



function makePaginationHTML(){
    makeGroups()
    if(totalResults ==0){
        return;
    }
    console.log('makePaginationHTML 시작')
    const currentGroup = groupIndex      // nextGroup을 다루기 위해 변수 필요
    group = groups[currentGroup]  // 첫번째 그룹은 groups[0]  
                       // [1,2,3,4,5] 혹은 [6,7,8,9,10]
    
    console.log('currentGroup :', currentGroup)
    console.log('group :', group)


    let paginationHTML =`<li class="prev-li"><button class="page-btn" id="prev-page" onclick="moveToPage('prev page')">prev page</button></li><li class="page-li"><button class="page-btn" id="prev" onclick="moveToPage(${page-1})">Prev</button></li>`;
    // page가 전역변수라서 page-1 이 최신페이지에서 이전페이지가 된다.
    
    paginationHTML += group.map(i => {
        return `<button class="page-btn" id="page" onclick="moveToPage(${i})">${i}</button>`
        }).join('')

    paginationHTML += `<li class="next-li"><button class="page-btn" id="next" onclick="moveToPage(${page+1})">Next</button></li><li class="next-li"><button class="page-btn" id="next-page" onclick="moveToPage('next page')">next page</button><span>${page} of ${totalPages} pages</span></li>`


    return paginationHTML;
}


function moveToPage(pageNo){
    console.log('clicked!')
    if(pageNo == 'prev page'){
        groupIndex--
        group = groups[groupIndex]
        page = group[0]
        currentIndex = 0
    } else if(pageNo == 'next page'){
        groupIndex++
        group = groups[groupIndex]
        page = group[0]
        currentIndex =0
    } else {
        page = pageNo;   
        currentIndex = group.indexOf(page)
    } 

    render() 

}





async function getNews(){
    const newsUrl = new URL(url3);
    newsUrl.searchParams.set("page",page)  // &page=page
    newsUrl.searchParams.set("pageSize",pageSize) //&pageSize=pageSize
    try{
        const response = await fetch(newsUrl);  
        const data = await response.json()
        console.log('data: ', data)  
        if (response.status == 200){
            console.log('data : ', data);
            if(data.articles.length == 0){                
                throw new Error('No result for this search');
            }
            newsList = data.articles;             
            totalResults = data.totalResults;
            console.log('newsList :', newsList)
            console.log('totalResults :', totalResults)

            render();
             
        } else{
            throw new Error('예상 못한 에러를 만났습니다.')
        }

    } catch(e){
        // console.log(e.message)
        errorRender(e.message)
    }
    
}

getNews();



