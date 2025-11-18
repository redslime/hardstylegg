import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";

export default defineNuxtPlugin(() => {
    countries.registerLocale(en);

    return {
        provide: {
            countries
        }
    };
});
