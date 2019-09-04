import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import api from '../../services';
import Container from '../../Components/Container';

import { Loading, Owner, IssueList, Controls } from './styles';

export default class Repository extends Component {
	static propTypes = {
		match: PropTypes.shape({
			params: PropTypes.shape({
				repository: PropTypes.string,
			}),
		}).isRequired,
	};

	state = {
		repository: {},
		issues: [],
		loading: true,
		issuePage: 1,
		issueState: 'closed'
	};

	getRepoName() {
		const { match } = this.props;
		return decodeURIComponent(match.params.repository);
	}

	async componentDidMount() {
		const [repository, issues] = await Promise.all([
			api.get(`/repos/${this.getRepoName()}`),
			this.getIssues(),
		]);

		console.log(repository.data);

		this.setState({
			repository: repository.data,
			issues: issues.data,
			loading: false,
		});
	}

	 changeIssueState = async e => {
		const state = e.target.value;
		try {
			this.setState({loading: true});
			const {data:issues} = await this.getIssues();
			this.setState({
				loading: false,
				issues: issues,
				issueState: state,
			});
		} catch(err) {
			console.error(err);
			this.setState({loading: false});
		}
	}

	handlePage = async page => {
		this.setState({
			loading: true,
			issuePage: page==='back' ? --this.state.issuePage : ++this.state.issuePage,
		});
		const {data:issues} = await this.getIssues();
		this.setState({
			loading: false,
			issues,
		});
	}

	getIssues() {
		return api.get(`/repos/${this.getRepoName()}/issues`,{
			params: {
				state: this.state.issueState,
				page: this.state.issuePage,
				per_page: 5,
			},
		});
	}

	render() {
		const { repository, issues, issuePage, issueState, loading } = this.state;

		if (loading) {
			return <Loading>Carregando</Loading>;
		}

		return (
			<Container>
				<Owner>
					<Link to="/">Voltar aos repositórios</Link>
					<img
						src={repository.owner.avatar_url}
						alt={repository.owner.login}
					/>
					<h1>{repository.name}</h1>
					<p>{repository.description}</p>
				</Owner>

				<Controls>
					<button
					type="button"
					disabled={issuePage < 2}
					onClick={()=>this.handlePage('back')}
					>Voltar</button>

					<select defaultValue={issueState} onChange={this.changeIssueState}>
						<option value="open">open</option>
						<option value="closed">closed</option>
						<option value="all">all</option>
					</select>
					<button
					type="button"
					onClick={()=>this.handlePage('next')}>Avançar</button>
				</Controls>

				<IssueList>
					{issues.map(issue => (
						<li key={String(issue.id)}>
							<img
								src={issue.user.avatar_url}
								alt={issue.user.login}
							/>
							<div>
								<strong>
									<a href={issue.html_url}>{issue.title}</a>
									{issue.labels.map(label => (
										<span key={String(label.id)}>
											{label.name}
										</span>
									))}
								</strong>
								<p>{issue.user.login}</p>
							</div>
						</li>
					))}
				</IssueList>
			</Container>
		);
	}
}
