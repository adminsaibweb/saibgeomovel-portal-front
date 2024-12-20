import styled from 'styled-components';

export const DialogOptions = styled.div`
  position: fixed;
  left: 0;
  top: 0;

  background: rgb(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;

  height: 100%;
  width: 100%;
  z-index: 999;
`;

export const DialogContent = styled.div`
  z-index: 999;
  display: flex;
  width: 97%;
  flex-direction: column;
  gap: 1.2rem;
  background: #fff;
  padding: 0.6rem;
  border-radius: 2px;

  > h2 {
    font-size: 1.4rem;
    font-weight: 600;
    color: #8e44ad;
    margin: 0;
  }
`;

export const ContentCollapsible = styled.div`
  width: 100%;
  .collapsible-header {
    background-color: #bf1f7c;
    padding-bottom: 5px;
    color: white;
    font-weight: 700;
    font-size: 1rem;
    align-items: center;
    gap: 0.2rem;
    border-radius: 5px;
  }
`;
