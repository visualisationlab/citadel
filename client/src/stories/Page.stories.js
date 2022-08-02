"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggedIn = exports.LoggedOut = void 0;
const react_1 = __importDefault(require("react"));
const testing_library_1 = require("@storybook/testing-library");
const Page_1 = require("./Page");
exports.default = {
    title: 'Example/Page',
    component: Page_1.Page,
    parameters: {
        // More on Story layout: https://storybook.js.org/docs/react/configure/story-layout
        layout: 'fullscreen',
    },
};
const Template = (args) => react_1.default.createElement(Page_1.Page, Object.assign({}, args));
exports.LoggedOut = Template.bind({});
exports.LoggedIn = Template.bind({});
// More on interaction testing: https://storybook.js.org/docs/react/writing-tests/interaction-testing
exports.LoggedIn.play = ({ canvasElement }) => __awaiter(void 0, void 0, void 0, function* () {
    const canvas = (0, testing_library_1.within)(canvasElement);
    const loginButton = yield canvas.getByRole('button', { name: /Log in/i });
    yield testing_library_1.userEvent.click(loginButton);
});
