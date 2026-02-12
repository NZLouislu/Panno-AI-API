# PannoAI - AI-Powered 3D Panorama Generator

PannoAI is a cutting-edge web application that transforms standard indoor photos into immersive 360° panoramas using Google's Gemini 2.x Multimodal AI. Designed for real estate, interior design, and digital twins, it provides a seamless experience from image upload to interactive 3D exploration.

## 🚀 Features

- **AI-Driven Scene Analysis**: Leverages `gemini-2.5-flash-image` to analyze uploaded photos and identify flooring, lighting, layout, and architectural styles.
- **Immersive 3D Viewer**: Built with Three.js and React Three Fiber, featuring smooth orbit controls, auto-rotation, and responsive design.
- **Intelligent Fallback System**: Implements a robust API key rotation mechanism to bypass quota limits and ensuring high availability.
- **Premium Aesthetics**: A modern, glassmorphic UI built with Next.js 15, Tailwind CSS, and Framer Motion.
- **Offline Reliability**: Integrated stable fallback textures and local storage history for a consistent user experience.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **3D Engine**: [Three.js](https://threejs.org/) with [@react-three/fiber](https://github.com/pmndrs/react-three-fiber)
- **AI Integration**: [Google Gemini API](https://ai.google.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📦 Getting Started

### Prerequisites

- Node.js 18.x or later
- A Google AI (Gemini) API Key

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/NZLouislu/panno-ai.git
    cd panno-ai
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Configure environment variables**:
    Create a `.env` file in the root directory:
    ```env
    Gemini_API=your_primary_api_key
    # Optional: Add multiple keys for rotation
    AULouis_Gemini_API=your_backup_key
    Blog_Gemini_API=your_backup_key
    Tasky_Gemini_API=your_backup_key
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

1.  **Upload**: Click the upload area or drag and drop indoor photos of a room.
2.  **Generate**: Click "Create 360° Panorama". PannoAI will analyze the images and map them to a high-quality 360° scene.
3.  **Explore**: Use your mouse or touch to look around the generated 3D room.
4.  **History**: Your previous creations are saved and can be accessed from the "Your Gallery" section.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
