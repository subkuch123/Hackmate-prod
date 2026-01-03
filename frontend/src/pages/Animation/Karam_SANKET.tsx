import React, { useEffect } from "react";
import "./Css/karamSanket.css";
const Karam_SANKET = ({ isVisible, setIsVisible, animationDuration }) => {
  //if (isVisible === false) return null;

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
    }, animationDuration);

    return () => clearTimeout(timer);
  }, [isVisible, animationDuration]);

  return (
    <>
      <div
        className="fixed top-0 left-0 w-full h-full inset-0 z-[100] right-0 bg-black bg-opacity-50 backdrop-blur-sm"
        style={{
          animation: "fadeIn 0.5s ease-in-out",
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          <div className="wrap relative w-[800px] h-[600px] overflow-hidden bg-transparent">
            {/* Scene 1 */}
            <div className="scene-1 absolute top-0 left-0 w-[800px] h-[600px] animate-sceneOne">
              <div className="bg-1 animation_to_left"></div>
              <div className="bg-2 animation_to_right"></div>
              <div className="back-table animation_to_left">
                <div className="books"></div>
                <div className="frame"></div>
              </div>
              <div className="photos animation_to_left"></div>
              <div className="shelf-1 animation_to_left">
                <div className="book"></div>
                <div className="camera">
                  <div className="camera__flash"></div>
                </div>
              </div>
              <div className="shelf-2 animation_to_left">
                <div className="books"></div>
                <div className="ship">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
              <div className="table animation_to_right">
                <div></div>
                <div></div>
                <div></div>
                <div className="tablet"></div>
                <div className="lamp">
                  <div></div>
                </div>
              </div>
              <div className="chair animation_to_right"></div>
              <div className="armchair animation_to_right">
                <div></div>
                <div className="plaid"></div>
              </div>
              <div className="picture animation_to_right">
                <div></div>
                <div></div>
              </div>
              <div className="red-dog animation_to_right">
                <div className="red-dog__body"></div>
                <div className="red-dog__leg"></div>
                <div className="red-dog__hand"></div>
                <div className="red-dog__head">
                  <div></div>
                  <div></div>
                </div>
              </div>
              <div className="man animation_to_right">
                <div className="man__leg">
                  <div className="man__knee">
                    <div className="man__feet">
                      <div></div>
                      <div></div>
                    </div>
                  </div>
                </div>
                <div className="man__body">
                  <div className="man__chest">
                    <div className="man__head">
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                    <div className="man__arm">
                      <div className="man__forearm">
                        <div></div>
                        <div></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scene 2 */}
            <div className="scene-2 absolute w-[800px] h-[600px] animate-sceneTwo">
              <div className="bg-1"></div>
              <div className="bg-2"></div>
              <div className="bg-3"></div>
              <div className="bg-4"></div>
              <div className="bg-5"></div>
              <div className="bg-6"></div>
              <div className="rock">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div className="lighthouse"></div>
              </div>
              <div className="girl">
                <div></div>
                <div></div>
                <div className="girl__back-leg">
                  <div className="girl__foot"></div>
                  <div className="girl__foot-thumbs"></div>
                </div>
                <div className="girl__back-arm">
                  <div className="girl__paper"></div>
                </div>
                <div className="girl__chest">
                  <div className="girl__face">
                    <div className="girl__nose"></div>
                  </div>
                </div>
                <div className="girl__back-shorts"></div>
                <div className="girl__front-leg">
                  <div className="girl__knee"></div>
                </div>
                <div className="girl__shorts"></div>
                <div className="girl__front-arm">
                  <div className="girl__forearm">
                    <div className="girl__palm"></div>
                  </div>
                </div>
              </div>
              <div className="stone"></div>
              <div className="basket">
                <div></div>
                <div></div>
              </div>
              <div className="sand">
                <div></div>
              </div>
              <div className="crab">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
              <div className="water">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>

            {/* Scene 3 */}
            <div className="scene-3 absolute w-[800px] h-[600px] animate-sceneThree">
              <div className="bg-1"></div>
              <div className="bg-2"></div>
              <div className="road">
                <div className="car">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div>
                    <div></div>
                  </div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                  <div className="sneakers">
                    <div></div>
                  </div>
                  <div className="papper"></div>
                  <div className="pizza">
                    <div className="pizza__fat"></div>
                  </div>
                  <div className="coffee"></div>
                  <div className="man">
                    <div className="man__legs">
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                      <div></div>
                    </div>
                    <div className="man__head">
                      <div className="man__beard"></div>
                      <div className="man__hair"></div>
                      <div className="man__nose"></div>
                    </div>
                    <div className="man__body"></div>
                    <div className="laptop"></div>
                    <div className="man__arm">
                      <div className="man__forearm"></div>
                    </div>
                    <div className="man__shorts"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scene 4 */}
            <div className="scene-4 absolute w-[800px] h-[600px] animate-sceneFour">
              <div className="bg-2"></div>
              <div className="bg-1"></div>
              <div className="scene-4__right">
                <div className="bookshelf"></div>
                <div className="photo"></div>
                <div className="books-1"></div>
                <div className="books-2"></div>
                <div className="books-3"></div>
              </div>
              <div className="scene-4__top">
                <div className="picture-1"></div>
                <div className="picture-2"></div>
                <div className="picture-3"></div>
                <div className="picture-4"></div>
                <div className="picture-5"></div>
                <div className="picture-6"></div>
                <div className="picture-7"></div>
                <div className="picture-8"></div>
              </div>
              <div className="scene-4__left">
                <div className="commode">
                  <div className="commode__box"></div>
                  <div className="printer"></div>
                </div>
                <div className="chair">
                  <div className="chair__legs"></div>
                  <div className="chair__back"></div>
                  <div className="girl">
                    <div className="girl__neck"></div>
                    <div className="girl__back-arm">
                      <div className="girl__palm"></div>
                    </div>
                    <div className="girl__body"></div>
                    <div className="girl__head">
                      <div className="girl__hair"></div>
                      <div className="girl__face"></div>
                    </div>
                    <div className="girl__front-arm">
                      <div className="girl__forearm">
                        <div className="teacup"></div>
                      </div>
                    </div>
                    <div className="girl__skirt"></div>
                    <div className="girl__back-leg"></div>
                    <div className="girl__front-leg"></div>
                  </div>
                </div>
                <div className="table">
                  <div className="table__leg"></div>
                  <div className="plant"></div>
                  <div className="plant__flower"></div>
                  <div className="monitor"></div>
                  <div className="keyboard"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all duration-300"
            aria-label="Close animation"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Duration indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded-full">
              Animation ends in: {Math.ceil(animationDuration / 1000)}s
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Karam_SANKET;
