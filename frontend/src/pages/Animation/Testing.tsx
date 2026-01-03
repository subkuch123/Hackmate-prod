import React, { useState } from 'react';
import './Css/testing.css';
const TestingWebsite = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  const menuItems = [
    "Men's",
    "Women's",
    "For children",
    "line",
    "DEMIX CLUB",
    "Gift cards",
    "line",
    "Terms and conditions",
    "Privacy policy",
    "Contact us"
  ];

  const navItems = [
    { name: "Sale", link: "#home" },
    { name: "Clothes", link: "#clothes" },
    { name: "Accessories", link: "#accessories" },
    { name: "Shoes", link: "#shoes" }
  ];

  const socialItems = [
    { icon: "twitter", name: "Twitter", link: "https://twitter.com/andrejsharapov" },
    { icon: "behance", name: "Behance", link: "https://www.behance.net/andrejsharapov" },
    { icon: "github", name: "GitHub", link: "https://dribbble.com/andrejsharapov" },
    { icon: "dribbble", name: "Dribbble", link: "https://dribbble.com/andrejsharapov" }
  ];

  const featureList = [
    "Whole site on pure css:",
    "parallax scrolling effect;",
    "simple animation of links and buttons with css-property 'cubic-bezier';",
    "smooth scrolling when click on the navigation;",
    "animation of the hamburger on click;",
    "open/close the click menu;",
    "colors of the headings;",
    "and etc."
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-300 via-gray-300 to-gray-100 font-['Lilita_One'] text-base antialiased">
      {/* Header */}
      <header className="relative px-4 grid grid-cols-3 items-center text-base">
        {/* Hamburger Menu */}
        <div className="relative">
          <input
            type="checkbox"
            id="navopen"
            className="hidden"
            checked={isNavOpen}
            onChange={toggleNav}
          />
          <label htmlFor="navopen" className="block w-20 cursor-pointer">
            <svg
              className={`ham relative z-10 w-20 cursor-pointer ${isNavOpen ? 'active' : ''}`}
              viewBox="0 0 100 100"
              onClick={toggleNav}
            >
              <path
                className="line top"
                d="m 30,33 h 40 c 13.100415,0 14.380204,31.80258 6.899646,33.421777 -24.612039,5.327373 9.016154,-52.337577 -12.75751,-30.563913 l -28.284272,28.284272"
                fill="none"
                stroke="white"
                strokeWidth="5"
              />
              <path
                className="line middle"
                d="m 70,50 c 0,0 -32.213436,0 -40,0 -7.786564,0 -6.428571,-4.640244 -6.428571,-8.571429 0,-5.895471 6.073743,-11.783399 12.286435,-5.570707 6.212692,6.212692 28.284272,28.284272 28.284272,28.284272"
                fill="none"
                stroke="white"
                strokeWidth="5"
              />
              <path
                className="line bottom"
                d="m 69.575405,67.073826 h -40 c -13.100415,0 -14.380204,-31.80258 -6.899646,-33.421777 24.612039,-5.327373 -9.016154,52.337577 12.75751,30.563913 l 28.284272,-28.284272"
                fill="none"
                stroke="white"
                strokeWidth="5"
              />
            </svg>
          </label>

          {/* Navigation Sidebar */}
          <div className={`navigation fixed top-0 left-0 z-30 pt-20 px-8 pb-4 flex flex-col justify-between w-1/2 h-screen bg-gradient-to-r from-gray-800 to-lime-400/60 text-white transition-transform duration-500 ease-[cubic-bezier(0.45,0.1,0,0.93)] ${isNavOpen ? 'translate-x-0' : '-translate-x-1/2'}`}>
            <ul className="flex flex-col m-0 p-0">
              {menuItems.map((item, index) => (
                item === "line" ? (
                  <li key={index} className="w-1/12 h-1 bg-gray-100 my-1"></li>
                ) : (
                  <li 
                    key={index}
                    className="relative my-1 uppercase text-2xl transition-transform duration-250 ease-[cubic-bezier(0.25,0.1,0,2.05)] hover:translate-x-1 group"
                  >
                    <span className="relative group-hover:before:opacity-100 group-hover:before:-translate-x-5 before:absolute before:top-0 before:-left-8 before:content-['›'] before:op-0 before:transition-all before:duration-250">
                      {item}
                    </span>
                  </li>
                )
              ))}
            </ul>
            <div className="copy text-sm">© 2019 built by Andrej Sharapov</div>
          </div>
        </div>

        {/* Logo */}
        <div className="logo text-center">
          <svg className="w-48" viewBox="0 0 190 33">
            <path d="M17.4080691,13.401856 C17.5734577,13.816656 17.9659275,14.789056 18.0748739,15.061056 C18.1536304,15.278656 18.1418169,15.547936 18.0013679,15.790016 C17.7322832,16.251056 13.2877927,24.037056 13.2877927,24.037056 C13.2877927,24.037056 22.0612642,18.625616 23.4500035,17.759296 C24.6405389,17.024896 24.8505561,15.479936 24.1653748,14.396016 C23.6849603,13.641216 16.0744594,1.655536 15.7358066,1.119696 C15.4522832,0.669536 15.7528705,0.004496 16.3343558,0.004496 L18.0919378,0.004496 C18.5684145,0.004496 19.1905907,0.083376 19.8206425,0.617856 C24.5237168,4.578176 34.7095544,13.162496 37.5789154,15.591456 C38.3940449,16.282336 38.6906943,17.524016 38.0212642,18.675936 C37.422715,19.700016 36.3660656,20.714576 34.2304525,21.545536 C31.9438895,22.434976 9.95376857,30.937696 6.31784456,32.376576 C5.3504525,32.754656 4.26755095,33.000816 2.96675648,33.000816 L0.630314335,33.000816 C0.0632677029,33.000816 -0.187440415,32.304496 0.157775475,31.911456 C1.10941623,30.804416 15.9195717,13.945856 16.531247,13.244096 C16.7977064,12.944896 17.2597444,13.021056 17.4080691,13.401856" fill="#bad532"/>
            <path d="M107.089821,17.8094208 C106.781324,17.4407415 106.227371,17.2351583 105.575503,17.2351583 L92.9378628,17.2351583 L94.3153683,14.4871961 L109.615471,14.4871961 C110.798489,14.4871961 112.043207,13.8307004 112.463031,13.0124793 L113.061247,11.8200967 C113.301338,11.3623314 113.25171,10.9292361 112.939189,10.5687802 C112.619962,10.2138065 112.072715,10 111.408776,10 L90.6026758,10 C89.4196574,10 88.1709158,10.652384 87.7604809,11.4664935 L79.9005176,27.1579745 C79.6537201,27.6280747 79.6953001,28.0940633 80.0105034,28.4298492 C80.3310719,28.7889346 80.8742946,29 81.5301858,29 L102.208864,29 C103.39993,29 104.6366,28.347616 105.059106,27.5184304 L105.684148,26.3013778 C105.90412,25.8600592 105.847785,25.4077761 105.556725,25.0706196 C105.254935,24.7224987 104.692934,24.5265094 104.055821,24.5265094 L89.2868696,24.5265094 L90.7046138,21.7072784 L103.783539,21.7072784 C104.945097,21.7072784 106.227371,21.0494121 106.63244,20.2366732 L107.237362,19.0621078 C107.455993,18.605713 107.410389,18.1506889 107.089821,17.8094208" fill="#bad532"/>
            <path d="M189.944182,10.5921409 C190.140728,11.0108401 189.812253,11.5203252 189.052991,11.9905149 L176.754028,19.398374 L181.671729,26.9647696 C181.926162,27.3631436 181.900584,27.7764228 181.596341,28.1409214 C181.273251,28.5379404 180.641879,28.7886179 179.906849,28.7886179 L176.153619,29 C174.697021,29 173.677941,28.5379404 173.077532,27.5867209 L170.337997,23.304878 L163.364636,27.5054201 C162.459983,28.0528455 161.043772,28.7886179 159.239852,28.7886179 L154.923906,28.7886179 C153.995022,28.7886179 153.716357,28.3848238 153.64097,28.2154472 C153.437692,27.7859079 153.702895,27.1829268 154.467542,26.7195122 L167.45711,18.895664 L162.842307,11.8319783 C162.582488,11.4390244 162.624221,11.0108401 162.906925,10.6707317 C163.235399,10.2574526 163.880233,10 164.615263,10 L168.503114,10 C169.969136,10 170.945137,10.5149051 171.557662,11.4701897 L173.869103,15.0298103 L180.557068,10.9891599 C181.457682,10.4417344 183.052939,10 184.850128,10 L188.654514,10 C189.591475,10 189.875525,10.401084 189.944182,10.5921409" fill="#bad532"/>
            <path d="M158.229352,10.5823597 C158.5374,10.9304053 158.581968,11.3784797 158.352571,11.8292947 L150.623844,27.5146401 C150.21224,28.3546084 148.966939,29 147.789803,29 L144.512697,29 C143.861208,29 143.31852,28.7848695 143.011782,28.4258618 C142.714221,28.0901486 142.657855,27.6475552 142.887252,27.2172941 L150.581897,11.4867301 C151.00661,10.668686 152.219139,10 153.373992,10 L156.714018,10 C157.361574,10 157.923926,10.2137603 158.229352,10.5823597" fill="#bad532"/>
            <path d="M147.394609,10.5603952 C147.714185,10.9097858 147.752481,11.3852311 147.517421,11.8524555 L139.796103,27.4941949 C139.368242,28.3532848 138.16257,29 136.981989,29 L133.778309,29 C133.12067,29 132.606972,28.8122882 132.276831,28.4464556 C131.971782,28.088844 131.932165,27.6408019 132.163263,27.159876 L136.933128,17.3920098 L126.813672,27.6914978 C126.046426,28.4259032 124.66512,29 123.608672,29 L122.344895,29 C121.1313,29 120.169932,28.31218 120.151444,27.4037643 L120.045799,17.3920098 L115.089735,27.4476094 C114.663194,28.31218 113.452240,28.9493041 112.265056,28.9493041 L109.069299,28.9493041 C108.41034,28.9493041 107.888718,28.7533713 107.578387,28.4012404 C107.266734,28.0573304 107.217874,27.5777746 107.454254,27.1160309 L115.183495,11.5181366 C115.607395,10.6782289 116.834196,10 117.977801,10 L123.808076,10 C124.422137,10 124.987337,10.1863417 125.384826,10.5138098 C125.762506,10.8330569 125.956628,11.2331434 125.940782,11.6743348 L125.964552,21.0722579 L135.502961,11.3852311 C136.262283,10.5987596 137.611896,10 138.722488,10 L145.943313,10 C146.569259,10 147.100124,10.2137449 147.394609,10.5603952" fill="#bad532"/>
            <path d="M81.685221,12.7638108 C83.0944902,14.3478292 83.0301889,16.6224578 81.4762419,19.6726525 C78.2317076,26.118347 72.0534285,29 61.4276457,29 L50.0463231,29 C49.3738391,29 48.8138823,28.7848695 48.4990741,28.4258618 C48.2016808,28.0901486 48.1547944,27.6475552 48.3785092,27.2159238 L53.9593225,16.0894274 L62.0277907,16.0894274 L57.9460005,24.1575076 L63.1852134,24.1575076 C69.9060344,24.1575076 71.8591851,22.7831386 73.5913002,19.3369393 C74.5544794,17.4405019 74.7058553,16.2908553 74.1003518,15.6070965 C73.4318867,14.850714 71.6636021,14.4862253 68.5516891,14.4862253 L66.476634,14.4862253 C66.476634,14.4862253 55.9606992,14.4889658 55.6150799,14.4862253 C54.9412563,14.4766335 54.0182654,14.4889658 53.4623274,14.3916775 C52.9586342,14.2834271 52.7617116,14.0682966 52.8568239,13.7545074 C53.0832179,12.8597288 53.9767375,11.3483341 55.0631608,10.5604356 C55.4837982,10.243906 56.1402068,10.0232944 57.5226839,10.0232944 C58.0652257,10 58.5997299,10 59.1422718,10 L70.5436885,10 C76.3897445,10 80.0508973,10.9098514 81.685221,12.7638108" fill="#bad532"/>
          </svg>
        </div>

        {/* Navigation */}
        <ul className="nav flex justify-end z-10">
          {navItems.map((item, index) => (
            <li key={index} className="relative mx-4 group">
              <a 
                href={item.link}
                className="text-gray-800"
              >
                {item.name}
              </a>
              <div className="absolute left-1 -bottom-1 z-[-1] w-[110%] h-[70%] bg-lime-400/70 transition-all duration-250 ease-[cubic-bezier(0.25,0.1,0,2.05)] group-hover:-left-[10%] group-hover:-bottom-[10%] group-hover:w-[120%] group-hover:h-[120%]"></div>
            </li>
          ))}
        </ul>
      </header>

      {/* Main Content */}
      <main className="relative px-4 grid grid-cols-[1fr_auto] text-base">
        <svg 
          className="triangle absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-1/2"
          viewBox="0 0 751 630"
        >
          <path d="M8.65930217,599.774835 L316.9784,12.5279339 C323.570257,1.34227863 340.049897,-2.35298248 366.417323,1.44215055 C368.414855,1.64189440 378.602269,8.13356932 396.979566,20.9171753 L719.381266,284.279433 C757.334378,312.443315 761.129689,342.704508 730.767199,375.06301 C730.478878,375.370286 704.399774,396.635346 694.51199,400.530351 C497.058468,478.311419 297.504999,553.215361 95.8515835,625.242175 C83.2671306,627.838845 72.0809501,629.13718 62.2930423,629.13718 C52.5051344,629.13718 36.0254936,629.13718 12.8541198,629.13718 C5.66300384,628.937436 1.46818618,626.640382 0.26966685,622.246017 C-0.928852482,617.851653 1.86769262,610.361258 8.65930217,599.774835 Z" fill="#bad532"/>
        </svg>

        <article className="relative overflow-hidden pl-36">
          {/* Feature List (Demo) */}
          <ul className="fcolumn absolute -top-20 right-2.5 p-4 flex flex-col items-start leading-relaxed font-['Montserrat'] border border-gray-200 rounded bg-gray-100 shadow-[6px_-6px_#bad532]">
            {featureList.map((item, index) => (
              <li key={index} className="relative pl-5 before:absolute before:top-1/2 before:left-0 before:w-4 before:h-4 before:bg-lime-400 before:rounded-full before:-translate-y-1/2">
                {item}
              </li>
            ))}
          </ul>

          {/* Slider */}
          <div className="slider relative h-[75vh] overflow-hidden overflow-y-auto flex flex-col justify-start items-center snap-y snap-mandatory">
            {/* Slide 1 */}
            <section id="home" className="slide slide-1 relative w-full min-h-screen flex flex-col justify-center items-center text-center snap-center">
              <div className="parallax absolute z-[-2] top-0 bottom-0">
                <img 
                  src="https://www.transparentpng.com/download/shirt/Iot4jd-dress-t-shirt-transparent-image.png" 
                  alt="T-shirt" 
                  className="w-[70vw]"
                />
              </div>
              <h3 className="sub text-2xl text-gray-100 mb-4 uppercase text-shadow-md">You are what you do</h3>
              <h1 className="title text-5xl uppercase mb-8 bg-gradient-to-r from-lime-400 via-lime-400 to-gray-100 bg-clip-text text-transparent">Sport where you are</h1>
              <a href="#" className="btn relative z-10 px-6 py-3 tracking-wider text-center font-light text-gray-800 bg-lime-400 rounded-full shadow-lg transition-all duration-250 ease-[cubic-bezier(0.25,0.1,0,2.05)] hover:tracking-widest">
                Let's start →
              </a>
            </section>

            {/* Slide 2 */}
            <section id="clothes" className="slide slide-2 relative w-full min-h-screen flex flex-col justify-center items-center text-center snap-center">
              <h3 className="sub text-2xl text-gray-800 mb-4 uppercase">For yoga, fitness and running</h3>
              <h1 className="title text-5xl uppercase mb-8 bg-gradient-to-r from-lime-400 via-lime-400 to-gray-100 bg-clip-text text-transparent">Men's and Women's clothing</h1>
            </section>

            {/* Slide 3 */}
            <section id="accessories" className="slide slide-3 relative w-full min-h-screen flex flex-col justify-center items-center text-center snap-center">
              <h3 className="sub text-2xl text-gray-800 mb-4 uppercase">For yoga, fitness and running</h3>
              <h1 className="title text-5xl uppercase mb-8 bg-gradient-to-r from-lime-400 via-lime-400 to-gray-100 bg-clip-text text-transparent">Men's and women's shoes</h1>
            </section>

            {/* Slide 4 */}
            <section id="shoes" className="slide slide-4 relative w-full min-h-screen flex flex-col justify-center items-center text-center snap-center">
              <div className="parallax absolute z-[-2] top-0 bottom-0">
                <img 
                  src="https://www.transparentpng.com/download/adidas-shoes/a4xO3G-adidas-shoes-adidas-shoe-kids-superstar-daddy-grade.png" 
                  alt="Shoes" 
                  className="w-[70vw]"
                />
              </div>
              <h4 className="sub text-2xl text-gray-800 mb-4 uppercase">New dimension of flexibility</h4>
              <h2 className="title text-5xl uppercase mb-8 bg-gradient-to-r from-lime-400 via-lime-400 to-gray-100 bg-clip-text text-transparent">
                Fle<span className="text-lime-400">X</span>Zome
                <span className="text-lime-400">360</span>
              </h2>
              <a href="#" className="btn relative z-10 px-6 py-3 tracking-wider text-center font-light text-gray-800 bg-lime-400 rounded-full shadow-lg transition-all duration-250 ease-[cubic-bezier(0.25,0.1,0,2.05)] hover:tracking-widest">
                Let's start →
              </a>
            </section>
          </div>
        </article>

        {/* Aside */}
        <aside className="relative -ml-4.5 bg-gray-100 flex items-end">
          <ul className="nums m-0 p-0 flex flex-col writing-mode-vertical-lr">
            <li className="relative my-4 p-4">scroll</li>
            <li className="relative my-4 p-4 before:absolute before:right-5 before:bottom-[calc(100%-0.5em)] before:w-px before:h-12 before:bg-gray-800/40">
              down
            </li>
          </ul>
        </aside>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-8 text-base">
        <ul className="social m-0 p-0 flex">
          {socialItems.map((item, index) => (
            <li key={index} className="mx-2">
              <a 
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-100 hover:text-lime-400 transition-colors"
                title={item.name}
              >
                <i className={`fab fa-${item.icon} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}></i>
                {` ${item.name}`}
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
};

export default TestingWebsite;