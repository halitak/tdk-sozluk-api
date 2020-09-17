const app = new Vue({
    el: "#app",
    data: {
        message: "Hello Vue!",
        message_input: "Aranacak kelimeyi giriniz",
        url_mean: "https://sozluk.gov.tr/gts?ara=",
        url_voice: "https://sozluk.gov.tr/yazim?ara=",
        url_voice_file: "https://sozluk.gov.tr/ses/",
        state_data: new URL(window.location).searchParams.get("word") ? true : false,
        state_dark_mode: localStorage.getItem("dark-mode") == null ? false : localStorage.getItem("dark-mode") == "true" ? true : false,
        state_autocomplete: false,
        data: [],
        data_autocomplete: [],
        word: new URL(window.location).searchParams.get("word"),
        word_input: "",
        language: "",
        voice: "",
        url: location.protocol + '//' + location.host + location.pathname,
        url_home: location.origin + location.pathname.split("/").splice(0, location.pathname.split("/").length - 1).join("/") + '/index.html'
    },
    methods: {
        get_data: () => {
            let i, j, k, result = {};
            result.word = app.word;
            app.state_data = true;
            fetch(app.url_voice + app.word)
                .then(res => res.json())
                .then(json => {
                    if (Array.isArray(json) && json.length > 0)
                        result.voice = json[0].seskod + ".wav";
                })
            fetch(app.url_mean + app.word)
                .then(res => res.json())
                .then(json => {
                    console.log(json);
                    const items = [];
                    for (i = 0; i < json.length; i++) {
                        //console.log(app.word, json[i].lisan, voice);
                        result.language = json[i].lisan;
                        if (json[i].hasOwnProperty("birlesikler") && json[i].birlesikler) {
                            console.log(json[i]);
                            result.words = json[i].birlesikler.split(", ");
                        }
                        if (json[i].hasOwnProperty("atasozu"))
                            result.proverb = json[i].atasozu.map(({ madde }) => madde);
                        let temp;
                        for (j = 0; j < json[i].anlamlarListe.length; j++) {
                            const item = {};
                            //console.log(json[i].anlamlarListe[j].anlam);//anlam
                            item.mean = json[i].anlamlarListe[j].anlam;
                            const type = [];
                            const samples = [];
                            if (j == 0 && json[i].anlamlarListe[j].hasOwnProperty("ozelliklerListe"))
                                temp = json[i].anlamlarListe[j].ozelliklerListe[0].tam_adi;
                            else if (json[i].anlamlarListe[j].fiil == "0") {
                                //console.log(temp);//ozellik
                                type.push(temp);
                            }
                            if (json[i].anlamlarListe[j].hasOwnProperty("ozelliklerListe")) {
                                for (k = 0; k < json[i].anlamlarListe[j].ozelliklerListe.length; k++) {
                                    //console.log(json[i].anlamlarListe[j].ozelliklerListe[k].tam_adi);//ozellik
                                    type.push(json[i].anlamlarListe[j].ozelliklerListe[k].tam_adi);
                                }
                            }
                            if (json[i].anlamlarListe[j].hasOwnProperty("orneklerListe")) {
                                for (k = 0; k < json[i].anlamlarListe[j].orneklerListe.length; k++) {
                                    const sample_obj = {};
                                    //console.log(json[i].anlamlarListe[j].orneklerListe[k].ornek);//ornek
                                    sample_obj.sample = json[i].anlamlarListe[j].orneklerListe[k].ornek;
                                    if (json[i].anlamlarListe[j].orneklerListe[k].hasOwnProperty("yazar")) {
                                        //console.log(json[i].anlamlarListe[j].orneklerListe[k].yazar[0].tam_adi);//yazar
                                        sample_obj.author = json[i].anlamlarListe[j].orneklerListe[k].yazar[0].tam_adi;
                                    }
                                    samples.push(sample_obj);
                                }
                            }
                            item.type = type;
                            item.samples = samples;
                            items.push(item);
                        }
                    }
                    result.means = items;
                    app.data = result;
                    //console.log(result);
                })
        },
        dark_mode: () => {
            app.state_dark_mode = app.state_dark_mode ? false : true;
            localStorage.setItem("dark-mode", app.state_dark_mode);
        },
        play: (event) => {
            console.log(event.target.firstElementChild.play());

        },
        autocomplete: () => {
            if (app.word_input == ""){
                app.data_autocomplete = []
                app.state_autocomplete = false;
            }
            else {
                fetch("kelimeler.json")
                    .then(res => res.json())
                    .then(json => {
                        app.data_autocomplete = json.filter((word, index) => word.startsWith(app.word_input)).slice(0, 10);
                        app.state_autocomplete = app.data_autocomplete.length > 0 ? true : false;
                    })
            }
        },
        hide_autocomplete: () => {
            setTimeout(() => { app.state_autocomplete = false }, 200)
        }
    }
})
if (app.state_data)
    app.get_data();