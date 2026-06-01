<div align="center">
  <img src="https://img.icons8.com/color/120/000000/shop.png" alt="PazarB2B Logo" width="100"/>
  <h1>PazarB2B (Surplus Management) 🚀</h1>
  <p><i>Next-Generation B2B Platform for Wholesale & Surplus Goods Management</i></p>
  
  <p>
    <a href="https://reactnative.dev/"><img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native"/></a>
    <a href="https://expo.dev/"><img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo"/></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/></a>
    <a href="https://orm.drizzle.team/"><img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM"/></a>
  </p>
</div>

---

## 📱 About The Project

**PazarB2B** is an advanced mobile application engineered to streamline Business-to-Business (B2B) trade and intelligently manage surplus inventory. 
Designed with modern mobile architecture, it empowers enterprises to minimize waste, discover new wholesale partners, and optimize supply chain operations through a seamless digital experience.

### ✨ Key Features

*   📦 **Surplus Inventory Management:** Effortlessly list, track, and monetize excess goods.
*   🤝 **B2B Networking:** Quickly establish connections with verified industry partners.
*   🔔 **Real-Time Notifications:** Stay updated on orders, inquiries, and market trends.
*   🎨 **Modern UI/UX:** A highly responsive, intuitive interface built with Expo Router.
*   🔒 **Enterprise-Grade Security:** Robust data protection for user information and trade transactions.

---

## 📸 Screenshots (Coming Soon)

<div align="center">
  <img src="https://placehold.co/250x500/EEF4F0/333333?text=Dashboard" alt="Dashboard" width="200" style="margin-right:15px; border-radius: 10px;"/>
  <img src="https://placehold.co/250x500/EEF4F0/333333?text=Product+Catalog" alt="Catalog" width="200" style="margin-right:15px; border-radius: 10px;"/>
  <img src="https://placehold.co/250x500/EEF4F0/333333?text=B2B+Partners" alt="Partners" width="200" style="border-radius: 10px;"/>
</div>

---

## 🛠️ Technology Stack

We leverage a cutting-edge mobile development stack to ensure high performance, maintainability, and exceptional user experience:

- **Core:** React Native, Expo, TypeScript
- **Routing:** Expo Router (File-based navigation)
- **Database & ORM:** Drizzle ORM (Type-safe database interactions)
- **State & Data Fetching:** React Query
- **Styling:** Custom StyleSheet / NativeWind
- **CI/CD & Builds:** Expo Application Services (EAS)

---

## 🚀 Quick Start for Developers

Follow these instructions to set up the project locally.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo Go app on your physical device (or iOS Simulator / Android Emulator)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Amertos/PazarB2B.git
   ```

2. **Navigate to the project directory & install dependencies:**
   ```bash
   cd PazarB2B
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. *Scan the generated QR code using your Expo Go app to view it on your mobile device.*

---

## 📦 Building for Production

This project is configured with **EAS (Expo Application Services)** for automated cloud builds.

To generate standalone production binaries:

*   **Android (APK):**
    ```bash
    eas build --platform android --profile production
    ```
*   **iOS (IPA):**
    ```bash
    eas build --platform ios --profile production
    ```

*Note: Build artifacts are deliberately ignored via `.gitignore` to maintain a clean and secure repository.*

---

## 🔒 Security Notice

This repository strictly adheres to security best practices:
- No **API Keys** or **Database Credentials** are exposed.
- `.env` files and local environment configurations are securely ignored.

---

<div align="center">
  <sub>Built with ❤️ for a smarter B2B ecosystem.</sub>
</div>
