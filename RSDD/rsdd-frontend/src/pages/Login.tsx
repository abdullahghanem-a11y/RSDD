import React, { useState } from "react";
import styled from "styled-components";
import useAuth from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledWrapper>
      <div id="Container">
        <form className="form" onSubmit={handleSubmit}>
          <div id="login-lable">LOGIN</div>

          <input
            className="form-content"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            className="form-content"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">
            {loading ? "Loading..." : "Continue"}
          </button>

          {error && (
            <p style={{ color: "red", marginTop: "10px", fontWeight: "bold" }}>
              {error}
            </p>
          )}
        </form>

        {/* 🔵 الآن تم نقل الـ rays فوق زر GitHub */}
        <div id="rays">
          <svg fill="none" viewBox="0 0 299 152" height="9em" width="18em">
            <path
              fill="url(#paint0_linear_8_3)"
              d="M149.5 152H133.42L0 0H149.5H299L165.58 152H149.5Z"
            />
            <defs>
              <linearGradient
                id="paint0_linear_8_3"
                x1="149.5"
                y1="152"
                x2="150.12"
                y2="12.1981"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#00E0FF" />
                <stop offset="1" stopColor="#65EDFF" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* 🔵 وزر GitHub أصبح تحتها */}
        <div style={{ marginTop: "2em", display: "flex", justifyContent: "center" }}>
          <a
            href="https://github.com/abdullahghanem-a11y/RSDD"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: "none" }}
          >
            <div className="light-button">
              <button className="bt">
                <div className="light-holder">
                  <div className="dot" />
                  <div className="light" />
                </div>
                <div className="button-holder">
                  <svg viewBox="0 0 496 512" xmlns="http://www.w3.org/2000/svg">
                    <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
                  </svg>
                  <p>GitHub</p>
                </div>
              </button>
            </div>
          </a>
        </div>

        <div id="emiter">
          <svg fill="none" viewBox="0 0 160 61" height="61" width="160"></svg>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle, #00111a, #000000);

  #Container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
  }

  #rays {
    z-index: 2;
    position: relative;
    bottom: -1.5em;
    animation: rays 2s ease-in-out infinite;
  }

  .form {
    position: relative;
    padding: 4%;
    z-index: 3;
    display: flex;
    flex-direction: column;
    border-radius: 0.5rem;
    border: 4px solid #fff;
    background: rgba(0, 255, 240, 0.52);
    box-shadow: 0px 0px 64px #1b7b98 inset, 0px 0px 16px #a8fffaa6;
    backdrop-filter: blur(3.5px);
    gap: 1em;
    animation: float 2s ease-in-out infinite;
    width: 320px;
  }

  #login-lable {
    text-align: center;
    color: white;
    font-size: 2rem;
    font-weight: 600;
    letter-spacing: 8px;
    text-shadow: 0px 0px 16px white;
  }

  .form-content {
    height: 3em;
    padding: 1px 8px;
    color: white;
    font-weight: bold;
    border-radius: 6px;
    border: 2px solid #fff;
    background: rgba(139, 255, 247, 0.486);
    box-shadow: 0px 0px 1px 3px #0bafa9 inset, 0px 4px 4px #181a6040;
  }

  .form button {
    cursor: pointer;
    height: 3.5rem;
    color: white;
    font-size: 1.5em;
    letter-spacing: 0.3rem;
    border: 2px solid #eee;
    background: linear-gradient(144deg, #1807cf, #2000ee 50%, #13949d);
  }

  /* GitHub button styles */
  .light-button button.bt {
    position: relative;
    height: 200px;
    display: flex;
    align-items: flex-end;
    outline: none;
    background: none;
    border: none;
    cursor: pointer;
  }

  .light-button button.bt .button-holder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100px;
    width: 100px;
    background-color: #0a0a0a;
    border-radius: 5px;
    color: #0f0f0f;
    font-weight: 700;
    transition: 300ms;
    outline: #0f0f0f 2px solid;
    outline-offset: 20;
  }

  .light-button button.bt .button-holder svg {
    height: 50px;
    fill: #0f0f0f;
    transition: 300ms;
  }

  .light-button button.bt .light-holder {
    position: absolute;
    height: 200px;
    width: 100px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .light-button button.bt .light-holder .dot {
    position: absolute;
    top: 0;
    width: 10px;
    height: 10px;
    background-color: #0a0a0a;
    border-radius: 10px;
    z-index: 2;
  }

  .light-button button.bt .light-holder .light {
    position: absolute;
    top: 0;
    width: 200px;
    height: 200px;
    clip-path: polygon(50% 0%, 25% 100%, 75% 100%);
    background: transparent;
  }

  .light-button button.bt:hover .button-holder svg {
    fill: rgba(101, 101, 121, 1);
  }

  .light-button button.bt:hover .button-holder {
    color: rgba(101, 101, 121, 1);
    outline: rgba(101, 101, 121, 1) 2px solid;
    outline-offset: 2px;
  }

  .light-button button.bt:hover .light-holder .light {
    background: rgb(255, 255, 255);
    background: linear-gradient(
      180deg,
      rgba(101, 101, 121, 1) 0%,
      rgba(255, 255, 255, 0) 75%,
      rgba(255, 255, 255, 0) 100%
    );
  }

  @keyframes float {
    50% {
      transform: translateY(25px);
    }
  }

  @keyframes rays {
    50% {
      opacity: 1;
    }
  }
`;
