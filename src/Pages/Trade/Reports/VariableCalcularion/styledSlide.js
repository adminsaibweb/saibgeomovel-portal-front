import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
`;

export const LayerClosed = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgb(0, 0, 0, 0.45);
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 0.2rem;

  z-index: 999;
  min-width: 66%;
  background: #fff;
  width: 80%;
  border-radius: 0.1rem;

  @media (max-width: 768px) {
    width: 91%;
  }

  .currentPhoto {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.1rem;
    width: 100%;
  }

  .currentImgSlide {
    width: 42rem;
    height: 32rem;

    @media (max-width: 768px) {
      width: 260px;
      height: 320px;
    }
  }
`;
