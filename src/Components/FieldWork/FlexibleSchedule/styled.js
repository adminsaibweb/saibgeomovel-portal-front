import styled from 'styled-components';

export const Content = styled.div`
  width: 100%;
  height: calc(100vh - 210px);

  display: flex;
`;

export const ContainerHeader = styled.div`
  display: flex;

  background: #7e3a9d;
  color: #fff;

  div {
    flex: 1;
    padding: 5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    p {
      text-align: center;
    }
  }
`;

export const ColumnDay = styled.div`
  height: 100%;
  width: 100px;
  border: 1px solid #8e44ad;
  flex: 1;
  max-height: calc(100vh - 210px);
  overflow-y: auto;
`;

export const ContentDays = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  color: #8e44ad;
  > p {
    color: #8e44ad;
    font-weight: 700;
  }
`;

export const ContentNumDay = styled.div`
  border-radius: 100%;

  font-weight: 600;
  padding: 0.4rem 0.8rem;

  background: ${(props) => (props.clicked ? '#bf1f7c' : '#8e44ad')};
  color: #fff;
`;

export const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
  flex-wrap: wrap;

  > div {
    display: flex;
  }

  .date {
    display: flex;
    p {
      padding-right: 5px;
      font-weight: 500;
      font-size: 1.1rem;
    }
  }

  div.contentIcons {
    display: flex;

    i {
      cursor: pointer;
    }
  }

  div.prev {
    margin-right: 5px;
  }
  div.next {
    margin-left: 5px;
  }

  select {
    display: block;
  }
`;

export const ItemClient = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  border-radius: 4px;
  background: ${(props) => (props.lastModified ? '#523FBA' : '#8e44ad')};
  padding: 0.5rem;
  margin: 0.15rem;

  color: #fff;
  font-weight: 700;
  cursor: pointer;

  > p {
    color: #dfdfdf;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    padding: 0.8rem 0.5rem;
  }
`;

export const ScheduleDesktop = styled.div`
  height: 100%;

  @media (max-width: 768px) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

export const ScheduleMobile = styled.div`
  @media (min-width: 769px) {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

export const Popover = styled.div`
  background: #fff;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 54px 55px, rgba(0, 0, 0, 0.12) 0px -12px 30px, rgba(0, 0, 0, 0.12) 0px 4px 6px,
    rgba(0, 0, 0, 0.17) 0px 12px 13px, rgba(0, 0, 0, 0.09) 0px -3px 5px;
  padding: 0.2rem;
  position: absolute;
  border: 1px solid #ccc;
  display: none;
  z-index: 1000;

  overflow-y: auto;
  max-height: 280px;
`;

export const ContentDialog = styled.div`
  display: flex;
  flex-direction: column;
  z-index: 999;
  min-width: 75%;
  gap: 4px;

  @media (max-width: 768px) {
    min-width: 100%;
    width: 100%;
  }

  > div {
    background: #fff;
    padding: 0.2rem;

    @media (max-width: 768px) {
      width: 100%;
      height: 100%;
      padding-top: 0.2rem;
    }
  }
`;
