import styled from 'styled-components';

export const Container = styled.div`
  /* width: calc(100vw - 74px); */
  height: 100vh;

  margin-left: 64px;
  @media (max-width: 764px) {
    width: 100vw;
    margin-left: 0;
  }

  .collapsible {
    width: 100%;
    margin: 0.2rem 0 0.4rem !important;
  }

  .collapsible-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 5px 5px;
    font-size: 0.9rem;
    font-weight: 900;
    color: white;
    background-color: #8e44ad;
    margin: 0 0.5rem;
  }
`;

export const DivImg = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  > img {
    width: 50%;
    max-height: 500px;
  }
`;
