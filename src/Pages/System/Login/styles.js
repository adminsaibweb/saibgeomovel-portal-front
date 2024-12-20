import styled, { keyframes, css } from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

export const LateralEsquerda = styled.div`
  img {
    z-index: 1;
  }
  background: linear-gradient(to right, #99979880, #403a3e00);
  height: 100vh;
  width: 100%;
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  padding-right: 20px;
  @media only screen and (min-width: 601px) {
    display: flex;
  }
  h5 {
    color: #999798;
    font-size: 2rem;
    font-weight: 400;
    margin-right: 40px;
    text-align: right;
  }
  strong {
    text-transform: capitalize;
    font-weight: 900;
  }
`;

export const LateralDireita = styled.div`
  height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  @media only screen and (max-width: 600px) {
    background: linear-gradient(to right, #99979880, #403a3e00);
  }
`;

export const LoginForm = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 4px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.24);
  max-width: 300px;
  padding: 30px 30px 10px 30px;
  max-height: 550px;
  width: 100%;
  background-color: white;
`;

const rotate = keyframes`
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
`;

export const SubmitButton = styled.button.attrs((props) => ({
  type: 'submit',
  disabled: props.loading === 'true',
}))`
  &[disabled] {
    cursor: not-allowed;
    opacity: 0.6;
  }

  :focus {
    background: #8e44ad;
    opacity: 0.8;
  }

  ${(props) =>
    props.loading === 'true' &&
    css`
      svg {
        animation: ${rotate} 2s linear infinite;
      }
    `}

  span {
    color: #fff;
    padding-top: 20px;
    padding-bottom: 20px;
    padding-right: 60px;
    padding-left: 60px;
  }
`;

export const Form = styled.form`
  margin-top: 0px;
  width: 100%;
  background-color: white;
  p {
    display: ${(props) => (props.error !== '' ? 'block' : 'none')};
    color: #ff3333;
    margin-bottom: 15px;
    border: 1px solid #ff3333;
    padding: 10px;
    width: 100%;
    text-align: center;
    margin-top: 20px;
  }
  input,
  select {
    width: 100%;
    border: 1px solid #eee;
    padding: 10px 15px;
    border-radius: 4px;
    font-size: 16px;
    margin-bottom: 10px;
  }
  @media only screen and (max-width: 601px) {
    margin-top: 20px;
  }
`;

export const DivSelect = styled.div`
  input:focus {
    border: none !important;
    box-shadow: none !important;
    height: 38px !important;
  }

  .sc-gKAblj .eIGroG {
    height: 38px;
  }

  .css-b62m3t-container {
    height: 38px;
  }

  .css-v68sna-control {
    height: 38px;
  }

  .css-1fdsijx-ValueContainer {
    height: 38px;
  }

  .css-qbdosj-Input {
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: start;
  }
`;

export const LogoRodape = styled.div`
  width: 80px;
  height: 54px;
  background-size: contain !important;
  @media only screen and (min-width: 601px) {
    display: none;
  }
  @media only screen and (max-width: 601px) {
    background: url(${(props) => props.logoSaib}) no-repeat;
  }
`;

export const LogoLogin = styled.div`
  width: 225px;
  height: 150px;
  background-size: contain !important;
  @media only screen and (max-width: 601px) {
    /* display: none; */
    height: 91px;
    background: url(${(props) => props.logoApp}) no-repeat;
  }
  @media only screen and (min-width: 601px) {
    background: url(${(props) => props.logoSaib}) no-repeat;
    /* background-color: green; */
  }
`;
