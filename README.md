# feathers-mongoose-casl-dashboard

  

### Admin screen with full CRUD functionality inside your react apps to your feathers-mongoose-casl

Demo: [https://feathersjs-mongoose-casl-admin.herokuapp.com/](https://feathersjs-mongoose-casl-admin.herokuapp.com/)
* the demo is depend on your local feathers-mongoose-casl server then keep the server running to see the screens

### How to install?
**1 - Install** [redxu-admin](https://github.com/doronnahum/redux-admin)
**2- Menu**
	inside your app menu add this:
```jsx
import  React, { Component } from  'react';
import {DashboardMenu, UserAbilityMenu} from  'feathers-mongoose-casl-dashboard';

export  default  class  Sidebar  extends  Component {
	render() {
	const  isAuthUser  =  this.props.user  &&  this.props.user._id
		return(
			<div>
			{isAuthUser && <DashboardMenu  renderItem={item  =>  <a  href={`/app/dashboard?screen=${item.result.name}`}>{item.result.name}</a>}  />}
			{isAuthUser && <UserAbilityMenu  renderItem={() =>  <a  href={'/app/user-abilities'}>User-abilities</a>}  />}
			</div>
		)
	}
};

```
DashboardMenu - will render list of services that user is able to read
UserAbilityMenu - will render the UserAbilityLink only if user able to post to UserAbility service 

**3- Create dashbaord screen that render DashboardApp with the relevant props**
Example of nextjs screen
```jsx
import  React  from  'react';
import {DashboardApp} from  'feathers-mongoose-casl-dashboard';
import  'feathers-mongoose-casl-dashboard/lib/style.css'
import  Router  from  'next/router';

// Optional -
// Change the local of the app
// default local is enUS
// you can import heIL or create you on local file
// to create your own local file, copy this [file](https://github.com/doronnahum/feathers-mongoose-casl-dashboard/tree/master/src/local/en-US.js) and update
import { DashboardApp, setLocal, locals } from  'feathers-mongoose-casl-dashboard';

setLocal(locals.heIL)

const  getUrl  =  function(props) {
	return  props.router.query  &&  props.router.query.screen
}

class  dashboard  extends  React.Component {
	constructor(props) {
		super(props);
		this.state  = {
			screenName:  getUrl(this.props),
			showErr:  false
			};
	};

  
componentDidMount() {
	const  screenName  =  getUrl(this.props)
	if(!screenName) {
		this.setState({showErr:  true})
	}else{
		this.setState({screenName})
	}
	Router.router.events.on('beforeHistoryChange', this.handleRouteChange)
}
 
	componentWillUnmount() {
		Router.router.events.off('beforeHistoryChange', this.handleRouteChange)
	}

	 
	handleRouteChange  = (res) => {
		const  urlParams  =  new  URLSearchParams(window.location.search);
		const  screenName  =  urlParams.get('screen');
		if(screenName  !==  this.state.screenName) {
			this.setState({screenName})
		}
	}

	render() {
		return (
			<DashboardApp
				url={this.state.screenName}
			/>
		)
	}
}

export  default  Page(dashboard);
```
4- Create user-abilities screen

```jsx
import  React  from  'react';
import  'feathers-mongoose-casl-dashboard/lib/style.css'
import {UserAbilities} from  'feathers-mongoose-casl-dashboard';

export  default  class  userAbilities  extends  React.Component {
	render() {
		return (
			<div>
			<UserAbilities  />
			</div>
		)
	}
}
```

![enter image description here](https://lh3.googleusercontent.com/yA50tzAExSBOwLYwW4r2KGrR6QsDYfAyQ4gW30hvRfI7DKnxlr-e1slRazf-dVcOIFXAW9J0gFUgew)

![enter image description here](https://lh3.googleusercontent.com/kdD1ld8foj19DJ1iEtIu0TpEd4mNop0Lf2bOgn4ceyKTN7Qe32o6XzdcgQ3dw4nvsn81kMnNzDXT1Q)