import * as Designhubz from 'designhubz-widget';

console.log('makeup_demo');

export async function makeupDemo()
{
    // My parameters
    const container = document.getElementById('designhubz-widget-container') as HTMLDivElement;
    // Different test products (no variation constraint)
    const _MakeupSKUS = ['MP000000008737126', 'MP000000008977078', 'MP000000008827661', 'MP000000009070355'];

    // Handle camera permissions before widget creation
    await demo_videoAuth();

    //  Prepare widget: creates the view
    console.log('Designhubz.createMakeupWidget');
    let widget = await Designhubz.createMakeupWidget(container, demo_progressHandler('Makeup widget'));
    console.log('widget =', widget);

    // Set user id for analytics: prerequisite for further interaction with the widget
    widget.setUserId('1234');

    let demoProductIndex = 0;
    async function cycleMakeupSKUS()
    {
        if(demoProductIndex < _MakeupSKUS.length)
        {
            const mpID = _MakeupSKUS[demoProductIndex];

            // Load a product from id (replaces fetchProduct+loadVariation)
            const product = await widget.loadProduct(mpID);

            console.log(`Loaded ${demoProductIndex + 1}/${_MakeupSKUS.length} '${mpID}'`, product);

            await new Promise<void>( resolve => setTimeout(resolve, 2000) );
            demoProductIndex++;
            cycleMakeupSKUS();
        }
    }
    await cycleMakeupSKUS();
    

    // Features: Listen to tracking events
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

    // Features: Take a snapshot of what is currently displayed in widget
    console.log(`   Press 'Enter' to take a snapshot of the viewer currently\nor 'alt + Enter' for a double snapshot.`);
    window.addEventListener('keydown', async ke =>
    {
        if(ke.code === 'Enter')
        {
            if(ke.altKey)
            {
                // requet and await double snapshot results
                const {snapshot, originalSnapshot} = await widget.takeDoubleSnapshotAsync();

                // create a canvas that draws both snapshots
                const canvas = document.createElement('canvas');
                canvas.width = snapshot.imageData.width * 2;
                canvas.height = snapshot.imageData.height;
                const context2d = canvas.getContext('2d')!;
                context2d.putImageData(snapshot.imageData, 0, 0);
                context2d.putImageData(originalSnapshot.imageData, snapshot.imageData.width, 0);

                // create png blob from composited canvas and open it
                const blob = await new Promise<Blob | null>( r => canvas.toBlob(r, 'png') );
                open(URL.createObjectURL(blob), '_blank');
            }
            else
            {
                // request a single snapshot
                const snapshot = await widget.takeSnapshotAsync();

                // use the snapshot with helper functions
                const blob = await snapshot.getBlobAsync('png');
                open(URL.createObjectURL(blob), '_blank');
            }
        }
    });

    // Features: Get recommendations
    const recommendations = await widget.fetchRecommendations(5);
    console.log('recommendations', recommendations);

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