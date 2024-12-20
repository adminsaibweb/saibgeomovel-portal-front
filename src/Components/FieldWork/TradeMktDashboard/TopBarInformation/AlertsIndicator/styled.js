import styled from 'styled-components';

export const Content = styled.div`
  display: flex;
  max-height: 100%;
  width: 100%;
  div.skeletonLoading {
    width: 14rem;
  }
`;

export const ContentCardAlerts = styled.div`
  display: flex;
  flex-grow: 1;
  max-height: 100%;
  justify-content: center;
  border-radius: 10px;
  padding: 10px;
  height: 5rem;

  background: #bd207b;
`;

export const TotalAlerts = styled.div`
  display: flex;
  justify-content: center;
  font-weight: 700;
  flex-direction: column;
  color: #fff;
  max-height: 100%;

  span {
    text-align: center;
    font-weight: bold;
    font-size: 1.5rem;
    line-height: 1.5rem;
  }
`;

export const Separator = styled.div`
  background: #fff;
  width: 1px;
  margin: 0 10px;
`;

export const ContentDetailsAlerts = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  p {
    font-size: 0.7rem;
  }
  div {
    line-height: 18px;
    display: flex;

    span,
    p {
      color: #fff;
    }

    span {
      font-weight: 700;
      margin-right: 5px;
    }
  }
`;
