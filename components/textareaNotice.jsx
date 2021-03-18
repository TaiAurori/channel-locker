const { req } = require("../modules/moldit.js");
const { React } = req('webpack');

module.exports = (props) => (
    <div className="wrapper-39oAo3">
        <div className="content-c_0cLD">
            <div className="text-2yjo70">
                <h3 className="title-FVgbgL base-1x0h_U size16-1P40sf">{props.children}</h3>
            </div>
        </div>
        <div class="buttonContainer-3AU1Ij">
            {props.onClick ? 
                <button type="button" onClick={props.onClick} className="button-1YxJv4 button-38aScr lookFilled-1Gx00P colorPrimary-3b3xI6 sizeSmall-2cSMqn grow-q77ONN">
                    <div className="contents-18-Yxp">{props.button ? props.button : "Confirm"}</div>
                </button>
            : ""}
        </div>
    </div>
)