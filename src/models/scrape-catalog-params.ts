import { Browser } from "puppeteer/lib/cjs/puppeteer/common/Browser";
import { Page } from "puppeteer/lib/cjs/puppeteer/common/Page";
import { Category } from "../enum/category.enum";

export interface ScrapingParameters {
    page: Page;
    browser?: Browser;
    category?: Category
}