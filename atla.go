package main

import (
    "encoding/json"
    "fmt"
    "math/rand"
    "net/http"
    "os"
    "time"
)

type Quote struct {
    ID     int    `json:"id"`
    Author string `json:"author"`
    Quote  string `json:"quote"`
}

var cachedQuotes []Quote

func main() {
    cachedQuotes = loadQuotes()
    if len(cachedQuotes) == 0 {
        fmt.Println("No quotes found in quotes.json")
        return
    }

    http.HandleFunc("/random-quote", getRandomQuote)
    http.HandleFunc("/quote", getSpecificCharacterQuote)

    fmt.Println("Server is running on :9329")
    if err := http.ListenAndServe(":9329", nil); err != nil {
        fmt.Println(err)
    }
}

func getRandomQuote(w http.ResponseWriter, r *http.Request) {
    rand.Seed(time.Now().UnixNano())
    randomIndex := rand.Intn(len(cachedQuotes))
    json.NewEncoder(w).Encode(cachedQuotes[randomIndex])
}

func getSpecificCharacterQuote(w http.ResponseWriter, r *http.Request) {
    r.ParseForm()
    character := r.Form.Get("author")
    var availableQuotes []Quote

    for _, quote := range cachedQuotes {
        if character != "" && quote.Author == character {
            availableQuotes = append(availableQuotes, quote)
        }
    }

    if len(availableQuotes) == 0 {
        getRandomQuote(w, r)
        return
    }

    rand.Seed(time.Now().UnixNano())
    randomIndex := rand.Intn(len(availableQuotes))
    json.NewEncoder(w).Encode(availableQuotes[randomIndex])
}

func loadQuotes() []Quote {
    file, err := os.Open("src/quotes.json")
    if err != nil {
        fmt.Println(err)
        return []Quote{}
    }
    defer file.Close()

    var quotesData []Quote
    if err := json.NewDecoder(file).Decode(&quotesData); err != nil {
        fmt.Println(err)
        return []Quote{}
    }

    return quotesData
}