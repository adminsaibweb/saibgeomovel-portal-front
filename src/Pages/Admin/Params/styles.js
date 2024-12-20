import styled from 'styled-components';

export const Container = styled.div`
  background-color: #fff;
  height: 100vh;
  overflow-y: auto;
  width: calc(100vw - 60px);

  @media (min-width: 769px) {
    margin-left: 60px !important;
  }
  @media (max-width: 768px) {
    width: 100vw;
  }
`;

export const Title = styled.h5`
  width: 100%;
  margin: 0.5rem 0 0.2rem 0;
  color: #8e44ad;
  font-weight: 500;
  padding-left: 0.8rem;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  overflow-x: auto;
`;

export const LinhaKey = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  flex-wrap: wrap;
  gap: 2rem;
  padding: 0.8rem;
  border-bottom: 1px solid lightgray;

  > textarea {
    position: relative;
    resize: none;
    width: 80%;
    min-width: 80%;
    max-width: 100%;
    height: 120px;
    padding: 0.5rem;
    border: none;
    border: 1px solid #d9d9d9;
    margin: 2px;
    color: #1a1a1a;
    box-shadow: 400;
  }

  @media (max-width: 768px) {
    justify-content: flex-start;
    > textarea {
      width: 95%;
    }
  }
`;

export const LinhaSaveButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0.8rem;
  width: 100%;

  > button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    background: #8e44ad !important;
    color: #fff;
    font-size: 1rem;
    font-weight: 500;
    border-radius: 100px;
    border: none;
    padding: 0.5rem 1rem;
    transition: all 0.2s linear;

    &:hover {
      background: #843fa2 !important;
      border-color: none !important;
    }
  }
`;

export const DivDetalheButtons = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: center;

  [type='checkbox'] + span:not(.lever) {
    color: #000;
    font-size: 1.2rem;
  }

  > button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    background: #8e44ad !important;
    color: #fff;
    font-size: 1rem;
    font-weight: 500;
    border-radius: 100px;
    border: none;
    padding: 0.5rem 1rem;

    transition: all 0.2s linear;

    &:hover {
      background: #843fa2 !important;
      border-color: none !important;
    }
  }

  @media (max-width: 769px) {
    flex-direction: row;
    justify-content: space-between;
    gap: 5px;
  }
`;

export const ScreenDialog = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;

  position: fixed;
  left: 0;
  top: 0;
  background-color: rgb(0, 0, 0, 0.45);
  z-index: 999;
`;
