import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import ThreeDModel from "../../../assets/models/third_person_animations.glb";

const Footer = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const mountNode = mountRef.current;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 300 / 200, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    // Renderer setup
    renderer.setSize(300, 200);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountNode.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Variable to store the loaded model
    let loadedModel = null;

    // Model loader
    const loader = new GLTFLoader();
    loader.load(
      ThreeDModel,
      (gltf) => {
        loadedModel = gltf.scene;
        loadedModel.scale.set(3, 3, 3);
        loadedModel.position.set(0, -2.5, 0);
        scene.add(loadedModel);
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error);
      }
    );

    // Camera position
    camera.position.z = 5;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Animate the model if it has been loaded
      if (loadedModel) {
        loadedModel.rotation.y += 0.01; // Adjust rotation speed as needed
      }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      mountNode.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* 3D Model Viewer */}
        <div className="model-viewer" ref={mountRef}></div>

        {/* Content Sections */}
        <div className="footer-sections">
          <div className="footer-section">
            <h3>About Us</h3>
            <p>
              We provide the best therapy services to help you heal and grow.
            </p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/about">About Us</a>
              </li>
              <li>
                <a href="/services">Services</a>
              </li>
              <li>
                <a href="/contact">Contact</a>
              </li>
              <li>
                <a href="/booking">Book Now</a>
              </li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contact Us</h3>
            <p>Email: mastersportstherapy@gmail.com</p>
            <p>Phone: +44 7479204852</p>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2025 Master Sports Therapy. All rights reserved.</p>
        <p>&copy; Designed by Optimus Innovations (pvt) ltd.</p>
      </div>
    </footer>
  );
};

export default Footer;
