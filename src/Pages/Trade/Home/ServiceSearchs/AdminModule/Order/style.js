import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center !important;
  justify-content: space-between;

  background-color: #fff;
  align-items: flex-start;
  width: 100%;
  height: 92vh;

  @media (max-width: 768px) {
    margin-left: 0px;
    padding-top: 50px;
  }
`;

export const TextAreaDiv = styled.div`
  textarea {
    position: relative;
    resize: none;
    height: 6rem;
    padding: 5px;
    border: none;
    border: 1px solid #b3b3b3;
    margin: 2px;
    color: #000;
    box-shadow: 400;
    font-size: 1.2rem;
  }
`

export const ContainerScanner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100%;

  .btn1-scanner {
    z-index: 999;
    position: fixed;
    top: 1rem;
    left: 1rem;
  }

  .btn3-scanner {
    background-color: #000;
    border-radius: 16px;
    padding: 0.5rem 2rem;

    z-index: 999;
    position: fixed;
    top: 65%;
    left: 36%;

    > span {
      font-size: 12px;
      font-weight: 600;
      color: #fff;
    }
  }
`;

export const Shadow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 50%;

  z-index: 999;
  width: 66%;
  background-color: rgba(0,0,0, 0.35);

  padding-left: 0.5rem /* 8px */;
  padding-right: 0.5rem /* 8px */;
  padding-top: 2.5rem /* 40px */;
  padding-bottom: 2.5rem /* 40px */;
  border-radius: 0.75rem /* 12px */;

  .teste {
    background-color: #f8f9fe;
    height: 1px;
    width: 91%;
  }
`;
