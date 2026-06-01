<div align="center">
  <img src="https://img.icons8.com/color/120/000000/shop.png" alt="PazarB2B Logo" width="100"/>
  <h1>PazarB2B (Višak) 🚀</h1>
  <p><i>Vaša B2B platforma za upravljanje viškovima robe i veleprodajom</i></p>
  
  <p>
    <a href="https://expo.dev/"><img src="https://img.shields.io/badge/Built_with-Expo-000020.svg?logo=expo" alt="Expo"/></a>
    <a href="https://reactnative.dev/"><img src="https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB" alt="React Native"/></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white" alt="TypeScript"/></a>
  </p>
</div>

---

## 📱 O aplikaciji

**PazarB2B** je napredna mobilna platforma namenjena olakšavanju B2B (Business-to-Business) trgovine i pametnom upravljanju viškovima robe. 
Aplikacija omogućava preduzećima brz i efikasan način za pronalaženje novih partnera, optimizaciju zaliha i smanjenje otpada uz održivo poslovanje.

### ✨ Ključne funkcionalnosti

*   📦 **Upravljanje viškovima robe:** Lako dodavanje i pregled dostupnih viškova.
*   🤝 **B2B Povezivanje:** Brzo uspostavljanje kontakta sa drugim kompanijama.
*   🔔 **Notifikacije u realnom vremenu:** Pratite status narudžbina i upita.
*   🎨 **Moderan UI/UX:** Intuitivan i brz interfejs baziran na najnovijim Expo ruterima.
*   🔒 **Sigurnost podataka:** Najviši standardi zaštite korisničkih informacija i transakcija.

---

## 📸 Slike ekrana (Uskoro)

<div align="center">
  <img src="https://placehold.co/200x400/EEF4F0/333333?text=Pocetni+Ekran" alt="Screenshot 1" width="200" style="margin-right:10px;"/>
  <img src="https://placehold.co/200x400/EEF4F0/333333?text=Katalog+Proizvoda" alt="Screenshot 2" width="200" style="margin-right:10px;"/>
  <img src="https://placehold.co/200x400/EEF4F0/333333?text=B2B+Partneri" alt="Screenshot 3" width="200"/>
</div>

---

## 🛠️ Tehnologije

- **Frontend:** React Native, Expo, TypeScript
- **Navigacija:** Expo Router
- **Baza i Backend:** Drizzle ORM, API integracije (sigurno skriveno od javnosti)
- **Instalacija i Build:** Expo Application Services (EAS)

---

## 🚀 Instalacija i Pokretanje (za developere)

Ako želite da pokrenete ovaj projekat lokalno na vašoj mašini:

1. **Klonirajte repozitorijum:**
   ```bash
   git clone https://github.com/Amertos/PazarB2B.git
   ```

2. **Uđite u folder i instalirajte zavisnosti:**
   ```bash
   cd PazarB2B
   npm install
   ```

3. **Pokrenite aplikaciju:**
   ```bash
   npx expo start
   ```

4. *Skenirajte QR kod preko "Expo Go" aplikacije na telefonu.*

---

## 📦 Build aplikacije (Instalacioni fajlovi)

Za kreiranje `.apk` ili `.ipa` instalacionih fajlova korišćen je EAS:

*   **Android (APK):**
    ```bash
    eas build --platform android --profile production
    ```
*   **iOS (IPA):**
    ```bash
    eas build --platform ios --profile production
    ```

Svi izgenerisani fajlovi se lokalno preuzimaju u `build_outputs` direktorijum (koji je sakriven iz GitHub repozitorijuma zarad sigurnosti).

---

## 🔒 Sigurnost

Ovaj projekat ne izlaže:
- **API ključeve** 
- **Lozinke baze podataka** 
- `.env` fajlovi i lokalne konfiguracije su uspešno sakriveni putem `.gitignore`.

---

<div align="center">
  <sub>Napravljeno sa ❤️ za bolju B2B trgovinu.</sub>
</div>
