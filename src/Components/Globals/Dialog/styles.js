import styled from 'styled-components';

export const Container = styled.div`
  display: ${(props) => (props.show ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 50;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0;
  left: 0;
  background-color: rgb(0, 0, 0, 0.3);

  .content {
    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
    background-color: white;
    max-height: 80%;
    max-width: 80%;
    border-radius: 6px;
    overflow: auto;

    @media (max-width: 639px) {
      width: 100%;
      height: 100%;
      max-height: 100%;
      max-width: 100%;
    }

    .item-1 {
      display: flex;
      flex-direction: column;
      align-items: start;
      justify-content: space-between;
      background: #8e44ad;
      width: 100%;
      padding: 4px 8px;
      border-top-left-radius: 0.375rem /* 6px */;
      border-top-right-radius: 0.375rem /* 6px */;

      > h2 {
        margin: 0.3rem 0;
        font-size: 1.1rem;
        font-weight: bold;
        color: white;
      }
    }

    .children {
      margin: 0.2rem 0;
      padding: 2px 4px;
      height: 100%;
      width: 100%;
      overflow: auto;
    }

    .button-dialog {
      display: flex;
      justify-content: flex-end;
      width: 100%;
      margin: 0.2rem 0;
      padding: 0.2rem;
    }
  }
`;
