const axios = require('axios');

class ThirdPartyService {
    /**
     * Fetches a motivational quote from the ZenQuotes API
     * Used to display with achievement celebrations
     * Third-party API: https://zenquotes.io/api
     */
    async getMotivationalQuote() {
        try {
            const response = await axios.get('https://zenquotes.io/api/random', {
                timeout: 5000
            });

            if (response.data && response.data.length > 0) {
                return {
                    quote: response.data[0].q,
                    author: response.data[0].a
                };
            }

            // Fallback quote
            return this.getFallbackQuote();
        } catch (error) {
            console.error('Error fetching motivational quote:', error.message);
            return this.getFallbackQuote();
        }
    }

    /**
     * Fetches ocean/marine facts from a public API
     * Third-party API: https://uselessfacts.jsph.pl
     */
    async getOceanFact() {
        try {
            const response = await axios.get('https://uselessfacts.jsph.pl/api/v2/facts/random?language=en', {
                timeout: 5000
            });

            if (response.data && response.data.text) {
                return {
                    fact: response.data.text,
                    source: response.data.source || 'Unknown'
                };
            }

            return this.getFallbackFact();
        } catch (error) {
            console.error('Error fetching fact:', error.message);
            return this.getFallbackFact();
        }
    }

    getFallbackQuote() {
        const quotes = [
            { quote: "The ocean stirs the heart, inspires the imagination and brings eternal joy to the soul.", author: "Wyland" },
            { quote: "We are tied to the ocean. And when we go back to the sea, we are going back from whence we came.", author: "John F. Kennedy" },
            { quote: "The sea, once it casts its spell, holds one in its net of wonder forever.", author: "Jacques Cousteau" },
            { quote: "In one drop of water are found all the secrets of all the oceans.", author: "Kahlil Gibran" },
            { quote: "The greatest threat to our planet is the belief that someone else will save it.", author: "Robert Swan" }
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    }

    getFallbackFact() {
        const facts = [
            { fact: "The ocean produces over 50% of the world's oxygen.", source: "NOAA" },
            { fact: "About 80% of all pollution in seas and oceans comes from land-based activities.", source: "UNEP" },
            { fact: "There are more microplastics in the ocean than stars in the Milky Way.", source: "Marine Pollution Bulletin" },
            { fact: "Every year, 8 million metric tons of plastic enter the ocean.", source: "Science Magazine" },
            { fact: "The ocean covers 71% of Earth's surface and holds 97% of Earth's water.", source: "NOAA" }
        ];
        return facts[Math.floor(Math.random() * facts.length)];
    }
}

module.exports = new ThirdPartyService();
