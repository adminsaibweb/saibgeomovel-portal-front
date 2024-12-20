import styled from 'styled-components';

export const ContentCardAlerts = styled.div`
  display: flex;

  max-height: 100%;
  justify-content: space-around;
  border-radius: 10px;
  padding: 10px;

  height: 5rem;

  background: #bd207b;
`;

export const Content = styled.div`
  max-height: 100%;
  width: 100%;
  div.skeletonLoading {
    width: 14rem;
  }
`;

export const TotalAlerts = styled.div`
  display: flex;

  justify-content: center;
  font-weight: 500;
  flex-direction: column;
  color: #fff;
  max-height: 100%;
  font-size: 1.6rem;
  line-height: 1.9rem;
  span {
    text-align: center;
    font-weight: 500;
    font-size: 1.6rem;
    line-height: 1.9rem;
  }
`;

export const Separator = styled.div`
  background: #fff;
  width: 1px;
  margin: 0 7px;
`;

export const ContentDetailsAlerts = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  div {
    line-height: 1.5rem;
    display: flex;

    span,
    p {
      font-size: 1.2rem;
      color: #fff;
    }

    span {
      font-weight: 700;
      margin-right: 10px;
    }
  }
`;
