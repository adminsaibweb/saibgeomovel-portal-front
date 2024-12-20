import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 0.2rem 0.4rem;
  width: 100%;
  height: 100%;

  /* max-height: 18rem; */
  /* height: ${(props) => (props.heightFixed ? '250px' : 'unset')}; */

  box-shadow: ${(props) => (props.withBoxShadow ? '-1px 1px 5px 1px rgb(0 0 0 / 10%)' : 'unset')};

  > div.titleList {
    width: 100%;
    display: flex;

    i,
    h5 {
      color: #bd207b;
    }
    h5 {
      font-weight: 500;
      margin: 0 0 0.2rem 0;
    }
  }
`;

export const ContentPhotos = styled.div`
  display: flex;
  flex-wrap: wrap;

  overflow-y: auto;
  p {
    max-width: 80%;
  }
`;
export const LinePhoto = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  min-width: 450px;
  padding: 5px 10px;
  margin: 0 10px;
  border-bottom: 1px solid #c2c2c2;
  @media (max-width: 768px) {
    min-width: calc(100% - 20px);
  }

  p {
    font-weight: 500;
    color: #000;
    font-size: 0.9rem;
    padding-top: 5px;
  }
  img {
    cursor: pointer;
    height: 30px;
    width: 30px;
  }
`;
