import * as Designhubz from 'designhubz-widget';

console.log('makeup_demo');

export async function makeupDemo()
{
    // My parameters
    const container = document.getElementById('designhubz-widget-container') as HTMLDivElement;
    const _MakeupSKUS = ['MP000000008737126', 'MP000000008977078', 'MP000000008827661', 'MP000000009070355'];

    // A) Handle camera permissions before widget creation
    await demo_videoAuth();

    // B-01) Prepare widget: creates the view
    console.log('Designhubz.createMakeupWidget');
    let widget = await Designhubz.createMakeupWidget(container, demo_progressHandler('Makeup widget'));
    console.log('widget =', widget);

    // B-02) User id (analytics): prerequisite for further interaction with the widget
    widget.setUserId('1234');

    // C) Fetch any makeup products from the catalog
    const product = await Designhubz.fetchMakeupProduct(_MakeupSKUS[0]);
    console.log('product =', product);

    // D) Load variation, which can be 'product', or any of 'product.variations'
    await widget.loadVariation(product);

    // E-01) Features: take snaphot
    // Listen to tracking events
    widget.onTrackingStatusChange.Add( status =>
    {
        const log = (text: string) => console.log(`TrackingStatus [${status}] ${text}`);
        switch(status)
        {
            case Designhubz.TrackingStatus.CameraNotFound: return log('Camera not found or detached');
            case Designhubz.TrackingStatus.Analyzing: return log('Face detected');
            case Designhubz.TrackingStatus.Tracking: return log('Tracking');
            case Designhubz.TrackingStatus.FaceNotFound: return log('Face lost');
            default: return log('Unhandled status');
        }
    });

    // E-02) Features: take snaphot
    // Take a snapshot of what is currently displayed in widget
    console.log(`   Press 'Enter' to take a snapshot of the viewer currently`);
    window.addEventListener('keydown', async ke =>
    {
        if(ke.code === 'Enter')
        {
            // requet and await snapshot result
            const snapshot = await widget.takeSnapshotAsync();

            // use the snapshot with helper functions
            const blob = await snapshot.getBlobAsync('png');
            open(URL.createObjectURL(blob), '_blank');
        }
    });

    // E-03) Features: fetch recommendations
    // Results are deferred until user has been identified and analysed
    // const recommendations = await widget.fetchRecommendations(3);
    // console.log('recommendations', recommendations);

    // Set 'external' stats, from actions that we don't control
    widget.setStat(Designhubz.Stat.Whishlisted);
    widget.setStat(Designhubz.Stat.AddedToCart);
    widget.setStat(Designhubz.Stat.SnapshotSaved);
    widget.setStat(Designhubz.Stat.SharedToSocialMedia);

    // Dispose of widget
    console.log(`   Press 'd' to dispose of the widget and resources`);
    window.addEventListener('keydown', async ke =>
    {
        if(ke.key === 'd') await widget.disposeAsync();
    });
}

/**
 * This create a 'test' video element and tries to play it (permission already given)
 * If it fails, it will retry with confirmation dialog (user action required to start video)
 */
export async function demo_videoAuth()
{
    const videoElement = document.createElement('video');
    videoElement.style.position ='absolute';
    document.body.prepend(videoElement);

    const tryPlayVideo = () => (navigator as Navigator).mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: 'user' },
    })
    .then( stream => {
        videoElement.srcObject = stream;
        return stream;
    })
    .then( stream => {
        stream.getTracks().forEach( track => track.stop() );
        videoElement.srcObject = null;
        videoElement.remove();
    });

    return tryPlayVideo()
    .catch( err => {
        if(err instanceof DOMException)
        {
            console.log(err.toString());
            console.log('tryPlayVideo with confirmation');
            if(window.confirm('Allow video access?')) return tryPlayVideo();
        }
        else
        {
            return err;
        }
    });
}

/** Creates a simple progress handler */
export function demo_progressHandler(label: string)
{
    const progressElement = document.getElementById('progress');
    const handler: Designhubz.TProgressCallback = (progress: number) => {
        const percent = Math.round(progress * 100);
        if(progressElement !== null) progressElement.style.width = `${percent}%`;
        console.log(`${label}: ${percent}%`);
    };
    return handler;
}

window.addEventListener('load', e => makeupDemo() );